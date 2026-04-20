'use client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { MenuItem, ModifierOption } from '@/data/menu';

// ─── Re-export types so existing imports keep working ─────────
export type TableStatus = 'free' | 'occupied' | 'ordering';
export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'delivered';

export interface TableData {
  id: string;
  number: number;
  capacity: number;
  section: string;
  status: TableStatus;
  openedAt?: string;
  currentTotal: number;
}

export interface OrderItem {
  name: string;
  qty: number;
  price?: number;
  modifiers?: string[];
  note?: string;
}

export interface OrderData {
  id: string;
  tableId: string | null;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  destination: 'bar' | 'kitchen';
  total: number;
  createdAt: string;
  staffName?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: ModifierOption[];
  customNote: string;
  totalPrice: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  emoji: string;
}

// ─── Mappers (Supabase row → app type) ───────────────────────
const mapTable = (row: any): TableData => ({
  id:           row.id,
  number:       row.number,
  capacity:     row.capacity,
  section:      row.section,
  status:       row.status as TableStatus,
  openedAt:     row.opened_at ?? undefined,
  currentTotal: Number(row.current_total) || 0,
});

const mapOrder = (row: any): OrderData => ({
  id:          row.id,
  tableId:     row.table_id ?? null,
  tableNumber: row.table_number,
  items:       Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]'),
  status:      row.status as OrderStatus,
  destination: row.destination,
  total:       Number(row.total),
  createdAt:   row.created_at,
  staffName:   row.staff_name ?? 'Staff',
});

// ─── Store interface ──────────────────────────────────────────
interface DemoStore {
  // Meta
  loading:    boolean;
  submitting: boolean;
  initialized: boolean;
  staff:      StaffMember | null;

  // Data
  tables: TableData[];
  orders: OrderData[];
  cart:   CartItem[];

  // Active context
  activeTableId: string | null;
  modifierItem:  MenuItem | null;
  notification:  { message: string; type: 'success' | 'info' | 'error' } | null;

  // Lifecycle
  initStore: () => Promise<void>;

  // Auth
  login:  (pin: string) => Promise<StaffMember | null>;
  logout: () => void;
  setStaff: (staff: StaffMember | null) => void;

  // Tables
  updateTableStatus: (id: string, status: TableStatus) => void;
  setActiveTable:    (id: string | null) => void;

  // Cart
  addToCart:      (item: MenuItem, modifiers?: ModifierOption[], note?: string) => void;
  removeFromCart: (id: string) => void;
  updateQty:      (id: string, qty: number) => void;
  clearCart:      () => void;

  // Orders
  submitOrder:       (tableId: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;

  // UI
  openModifierPanel:  (item: MenuItem) => void;
  closeModifierPanel: () => void;
  showNotification:   (message: string, type?: 'success' | 'info' | 'error') => void;
  clearNotification:  () => void;
}

// ─── Store ────────────────────────────────────────────────────
export const useDemoStore = create<DemoStore>((set, get) => ({
  loading:     true,
  submitting:  false,
  initialized: false,
  staff:       null,
  tables:      [],
  orders:      [],
  cart:        [],
  activeTableId: null,
  modifierItem:  null,
  notification:  null,

  // ── Lifecycle ─────────────────────────────────────────────
  initStore: async () => {
    if (get().initialized) return;
    set({ loading: true });

    // Load tables + active orders in parallel
    const [{ data: tableRows }, { data: orderRows }] = await Promise.all([
      supabase.from('floor_tables').select('*').order('number'),
      supabase.from('orders').select('*').neq('status', 'delivered').order('created_at', { ascending: false }),
    ]);

    set({
      tables:      (tableRows || []).map(mapTable),
      orders:      (orderRows  || []).map(mapOrder),
      loading:     false,
      initialized: true,
    });

    // ── Realtime: orders ──────────────────────────────────
    supabase.channel('orders-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, ({ new: row }) => {
        set(s => ({ orders: [mapOrder(row), ...s.orders] }));
        get().showNotification(`New order — Table ${row.table_number}`, 'info');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, ({ new: row }) => {
        if (row.status === 'delivered') {
          set(s => ({ orders: s.orders.filter(o => o.id !== row.id) }));
        } else {
          set(s => ({ orders: s.orders.map(o => o.id === row.id ? mapOrder(row) : o) }));
        }
      })
      .subscribe();

    // ── Realtime: tables ──────────────────────────────────
    supabase.channel('tables-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'floor_tables' }, ({ new: row }) => {
        set(s => ({ tables: s.tables.map(t => t.id === row.id ? mapTable(row) : t) }));
      })
      .subscribe();
  },

  // ── Auth ──────────────────────────────────────────────────
  login: async (pin) => {
    const { data } = await supabase
      .from('staff')
      .select('id, name, role, emoji')
      .eq('pin', pin)
      .eq('is_active', true)
      .single();
    if (data) {
      const member: StaffMember = { id: data.id, name: data.name, role: data.role, emoji: data.emoji };
      set({ staff: member });
      return member;
    }
    return null;
  },

  logout: () => set({ staff: null }),
  setStaff: (staff) => set({ staff }),

  // ── Tables ────────────────────────────────────────────────
  updateTableStatus: (id, status) =>
    set(s => ({ tables: s.tables.map(t => t.id === id ? { ...t, status } : t) })),

  setActiveTable: (id) => set({ activeTableId: id, cart: [] }),

  // ── Cart ──────────────────────────────────────────────────
  addToCart: (menuItem, modifiers = [], note = '') => {
    const { cart } = get();
    const modTotal  = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
    const unitPrice = menuItem.price + modTotal;

    const existingIdx = cart.findIndex(c =>
      c.menuItem.id === menuItem.id &&
      JSON.stringify(c.selectedModifiers.map(m => m.id).sort()) ===
        JSON.stringify(modifiers.map(m => m.id).sort()) &&
      c.customNote === note,
    );

    if (existingIdx !== -1) {
      set({
        cart: cart.map((c, i) =>
          i === existingIdx
            ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * unitPrice }
            : c,
        ),
      });
    } else {
      set({ cart: [...cart, { id: uuidv4(), menuItem, quantity: 1, selectedModifiers: modifiers, customNote: note, totalPrice: unitPrice }] });
    }
    get().showNotification(`${menuItem.name} added`, 'success');
  },

  removeFromCart: (id) =>
    set(s => ({ cart: s.cart.filter(c => c.id !== id) })),

  updateQty: (id, qty) =>
    set(s => ({
      cart: s.cart
        .map(c => {
          if (c.id !== id) return c;
          const unit = c.menuItem.price + c.selectedModifiers.reduce((s, m) => s + m.priceAdjustment, 0);
          return { ...c, quantity: qty, totalPrice: qty * unit };
        })
        .filter(c => c.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  // ── Submit order ──────────────────────────────────────────
  submitOrder: async (tableId) => {
    const { cart, tables, staff } = get();
    if (cart.length === 0) return;
    set({ submitting: true });

    const table     = tables.find(t => t.id === tableId);
    const barItems  = cart.filter(c => c.menuItem.categoryId !== 'food');
    const foodItems = cart.filter(c => c.menuItem.categoryId === 'food');
    const total     = cart.reduce((s, c) => s + c.totalPrice, 0);
    const isWalkin  = tableId === 'walkin';
    const now       = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const buildOrder = (items: CartItem[], destination: 'bar' | 'kitchen') => ({
      table_id:     isWalkin ? null : tableId,
      table_number: table?.number || 0,
      destination,
      status:       'new',
      total:        items.reduce((s, c) => s + c.totalPrice, 0),
      staff_name:   staff?.name || 'Staff',
      items: items.map(c => ({
        name:      c.menuItem.name,
        qty:       c.quantity,
        price:     c.menuItem.price,
        modifiers: c.selectedModifiers.map(m => m.name),
        note:      c.customNote || undefined,
      })),
    });

    // Write orders to Supabase
    if (barItems.length  > 0) await supabase.from('orders').insert(buildOrder(barItems,  'bar'));
    if (foodItems.length > 0) await supabase.from('orders').insert(buildOrder(foodItems, 'kitchen'));

    // Update table status
    if (!isWalkin && tableId) {
      await supabase.from('floor_tables').update({
        status:        'occupied',
        opened_at:     table?.openedAt || now,
        current_total: (table?.currentTotal || 0) + total,
      }).eq('id', tableId);
    }
    set({ cart: [], submitting: false });

    get().showNotification(
      `Order sent! ${barItems.length > 0 ? '🍹 Bar' : ''}${barItems.length > 0 && foodItems.length > 0 ? ' + ' : ''}${foodItems.length > 0 ? '🍽️ Kitchen' : ''}`,
      'success',
    );
  },

  // ── Update order status (optimistic + Supabase) ───────────
  updateOrderStatus: async (id, status) => {
    // Optimistic update for instant UI response
    if (status === 'delivered') {
      set(s => ({ orders: s.orders.filter(o => o.id !== id) }));
    } else {
      set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }));
    }
    // Persist to Supabase
    await supabase.from('orders').update({ status }).eq('id', id);
  },

  // ── Modifier panel ────────────────────────────────────────
  openModifierPanel:  (item) => set({ modifierItem: item }),
  closeModifierPanel: ()     => set({ modifierItem: null }),

  // ── Notifications ─────────────────────────────────────────
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 2000);
  },
  clearNotification: () => set({ notification: null }),
}));
