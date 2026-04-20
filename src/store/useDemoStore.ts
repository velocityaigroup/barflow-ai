'use client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { tablesApi, ordersApi } from '@/lib/api';
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

// ─── Backend selector ─────────────────────────────────────────
// Set NEXT_PUBLIC_API_URL in Vercel env vars to switch from Supabase → NestJS API
const NEST_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_NEST = NEST_API_URL.length > 0;

// ─── Supabase mappers (row → app type) ───────────────────────
const mapSupabaseTable = (row: any): TableData => ({
  id:           row.id,
  number:       row.number,
  capacity:     row.capacity,
  section:      row.section,
  status:       row.status as TableStatus,
  openedAt:     row.opened_at ?? undefined,
  currentTotal: Number(row.current_total) || 0,
});

const mapSupabaseOrder = (row: any): OrderData => ({
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

// ─── NestJS mappers (API response → app type) ────────────────
const nestStatusToStore = (status: string): OrderStatus => {
  switch (status) {
    case 'pending':
    case 'sent':    return 'new';
    case 'in_progress': return 'in_progress';
    case 'ready':   return 'ready';
    default:        return 'delivered';
  }
};

const storeStatusToNest = (status: OrderStatus): string => {
  switch (status) {
    case 'new':         return 'sent';
    case 'in_progress': return 'in_progress';
    case 'ready':       return 'ready';
    case 'delivered':   return 'delivered';
  }
};

const mapNestTable = (row: any): TableData => ({
  id:           row.id,
  number:       row.number,
  capacity:     row.capacity || 4,
  section:      row.section || 'Main',
  status:       (row.status as TableStatus) || 'free',
  openedAt:     undefined,
  currentTotal: 0,
});

const mapNestOrder = (row: any): OrderData => ({
  id:          row.id,
  tableId:     row.tableId || null,
  tableNumber: row.table?.number || 0,
  items:       (row.items || []).map((i: any) => ({
    name:      i.productName,
    qty:       i.quantity,
    price:     Number(i.unitPrice),
    modifiers: (i.selectedModifiers || []).map((m: any) => m.optionName).filter(Boolean),
    note:      i.customNote || undefined,
  })),
  status:      nestStatusToStore(row.status),
  destination: row.destination === 'kitchen' ? 'kitchen' : 'bar',
  total:       Number(row.total),
  createdAt:   row.createdAt,
  staffName:   'Staff',
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

    try {
      if (USE_NEST) {
        // ── NestJS API path ────────────────────────────────
        const [tablesRes, ordersRes] = await Promise.all([
          tablesApi.getAll(),
          ordersApi.getAll({ status: ['new', 'sent', 'in_progress', 'ready'] }),
        ]);

        set({
          tables:      (tablesRes || []).map(mapNestTable),
          orders:      (ordersRes  || []).map(mapNestOrder),
          loading:     false,
          initialized: true,
        });

        // NestJS WebSocket is at /barflow namespace — connect via useWebSocket hook
        // For now keep Supabase Realtime too if the backend writes to the same DB
        _subscribeSupabaseRealtime();
      } else {
        // ── Supabase path (default) ────────────────────────
        const [{ data: tableRows }, { data: orderRows }] = await Promise.all([
          supabase.from('floor_tables').select('*').order('number'),
          supabase.from('orders').select('*').neq('status', 'delivered').order('created_at', { ascending: false }),
        ]);

        set({
          tables:      (tableRows || []).map(mapSupabaseTable),
          orders:      (orderRows  || []).map(mapSupabaseOrder),
          loading:     false,
          initialized: true,
        });

        _subscribeSupabaseRealtime();
      }
    } catch (err) {
      console.error('initStore failed:', err);
      set({ loading: false, initialized: true });
    }
  },

  // ── Auth ──────────────────────────────────────────────────
  login: async (pin) => {
    if (USE_NEST) {
      // NestJS PIN login requires businessId — read from env or localStorage
      const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID || localStorage.getItem('barflow_business_id') || '';
      if (!businessId) {
        console.warn('NEXT_PUBLIC_BUSINESS_ID not set — PIN login requires businessId');
      }
      try {
        const { accessToken, user } = await import('@/lib/api').then(m =>
          m.authApi.pinLogin(businessId, pin)
        );
        if (typeof window !== 'undefined') localStorage.setItem('barflow_token', accessToken);
        const member: StaffMember = { id: user.id, name: user.name, role: user.role, emoji: '👤' };
        set({ staff: member });
        return member;
      } catch {
        return null;
      }
    }

    // Supabase path
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

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('barflow_token');
    set({ staff: null });
  },
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

    try {
      if (USE_NEST) {
        // ── NestJS path: split by destination, send two orders if needed
        const barItems  = cart.filter(c => c.menuItem.categoryId !== 'food');
        const foodItems = cart.filter(c => c.menuItem.categoryId === 'food');
        const isWalkin  = tableId === 'walkin';
        const tId       = isWalkin ? undefined : tableId;

        const buildNestItems = (items: CartItem[]) =>
          items.map(c => ({
            productName: c.menuItem.name,
            unitPrice:   c.menuItem.price,
            quantity:    c.quantity,
            selectedModifiers: c.selectedModifiers.map(m => ({
              groupId:         'custom',
              groupName:       'Modifiers',
              optionId:        m.id,
              optionName:      m.name,
              priceAdjustment: m.priceAdjustment,
            })),
            customNote: c.customNote || undefined,
          }));

        const sends: Promise<any>[] = [];
        if (barItems.length  > 0) sends.push(ordersApi.create({ tableId: tId, localId: uuidv4(), destination: 'bar',     items: buildNestItems(barItems)  }));
        if (foodItems.length > 0) sends.push(ordersApi.create({ tableId: tId, localId: uuidv4(), destination: 'kitchen', items: buildNestItems(foodItems) }));

        await Promise.all(sends);

        // Optimistic table status update
        if (!isWalkin) {
          set(s => ({ tables: s.tables.map(t => t.id === tableId ? { ...t, status: 'occupied' as TableStatus } : t) }));
        }
      } else {
        // ── Supabase path ──────────────────────────────────
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

        if (barItems.length  > 0) await supabase.from('orders').insert(buildOrder(barItems,  'bar'));
        if (foodItems.length > 0) await supabase.from('orders').insert(buildOrder(foodItems, 'kitchen'));

        if (!isWalkin && tableId) {
          await supabase.from('floor_tables').update({
            status:        'occupied',
            opened_at:     table?.openedAt || now,
            current_total: (table?.currentTotal || 0) + total,
          }).eq('id', tableId);
        }
      }

      set({ cart: [], submitting: false });
      const barItems  = cart.filter(c => c.menuItem.categoryId !== 'food');
      const foodItems = cart.filter(c => c.menuItem.categoryId === 'food');
      get().showNotification(
        `Order sent! ${barItems.length > 0 ? '🍹 Bar' : ''}${barItems.length > 0 && foodItems.length > 0 ? ' + ' : ''}${foodItems.length > 0 ? '🍽️ Kitchen' : ''}`,
        'success',
      );
    } catch (err) {
      console.error('submitOrder failed:', err);
      set({ submitting: false });
      get().showNotification('Failed to send order — please retry', 'error');
    }
  },

  // ── Update order status ───────────────────────────────────
  updateOrderStatus: async (id, status) => {
    // Optimistic update
    if (status === 'delivered') {
      set(s => ({ orders: s.orders.filter(o => o.id !== id) }));
    } else {
      set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }));
    }

    try {
      if (USE_NEST) {
        await ordersApi.updateStatus(id, storeStatusToNest(status));
      } else {
        await supabase.from('orders').update({ status }).eq('id', id);
      }
    } catch (err) {
      console.error('updateOrderStatus failed:', err);
      // Re-fetch to restore correct state
    }
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

// ─── Supabase Realtime subscriptions (shared by both paths) ──
function _subscribeSupabaseRealtime() {
  // Only subscribe once — Supabase handles duplicate channel names
  supabase.channel('orders-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, ({ new: row }) => {
      useDemoStore.setState(s => ({ orders: [mapSupabaseOrder(row), ...s.orders] }));
      useDemoStore.getState().showNotification(`New order — Table ${row.table_number}`, 'info');
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, ({ new: row }) => {
      if (row.status === 'delivered') {
        useDemoStore.setState(s => ({ orders: s.orders.filter(o => o.id !== row.id) }));
      } else {
        useDemoStore.setState(s => ({ orders: s.orders.map(o => o.id === row.id ? mapSupabaseOrder(row) : o) }));
      }
    })
    .subscribe();

  supabase.channel('tables-live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'floor_tables' }, ({ new: row }) => {
      useDemoStore.setState(s => ({ tables: s.tables.map(t => t.id === row.id ? mapSupabaseTable(row) : t) }));
    })
    .subscribe();
}
