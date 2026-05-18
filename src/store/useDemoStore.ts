'use client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase, HAS_SUPABASE } from '@/lib/supabase';
import { tablesApi, ordersApi } from '@/lib/api';
import { MenuItem, ModifierOption, CATEGORIES } from '@/data/menu';
import {
  savePendingOrder, getPendingOrders, getPendingOrderCount,
  removePendingOrder, incrementRetryCount, writeSyncLog, MAX_RETRY,
} from '@/lib/offline-db';

// ── Notification timer — module-level so it cancels across calls ──
let _notifTimer: ReturnType<typeof setTimeout> | null = null;

// ── Supabase realtime channel refs — kept module-level for cleanup ──
let _ordersChan:  ReturnType<typeof supabase.channel> | null = null;
let _tablesChan:  ReturnType<typeof supabase.channel> | null = null;

// ── Category destination helper (uses menu data, not categoryId hacks) ──
const getCategoryDestination = (categoryId: string): 'bar' | 'kitchen' =>
  CATEGORIES.find((c) => c.id === categoryId)?.destination ?? 'bar';

// ─── Re-export types ──────────────────────────────────────────
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
  isOffline?: boolean; // true = saved locally, not yet synced
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
const NEST_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_NEST = NEST_API_URL.length > 0;
const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || 'default';

// ─── Demo seed data (used when no backend is connected) ───────
const _now = () => new Date().toISOString();
const _ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();
const _hm  = (h: number, m: number) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

const DEMO_TABLES: TableData[] = [
  { id: 't1',  number: 1,  capacity: 4, section: 'Terrace', status: 'occupied', openedAt: _hm(19,45), currentTotal: 124 },
  { id: 't2',  number: 2,  capacity: 2, section: 'Terrace', status: 'free',     currentTotal: 0 },
  { id: 't3',  number: 3,  capacity: 6, section: 'Terrace', status: 'ordering', openedAt: _hm(21,15), currentTotal: 44  },
  { id: 't4',  number: 4,  capacity: 4, section: 'Terrace', status: 'occupied', openedAt: _hm(20,30), currentTotal: 87  },
  { id: 't5',  number: 5,  capacity: 2, section: 'Indoor',  status: 'free',     currentTotal: 0 },
  { id: 't6',  number: 6,  capacity: 8, section: 'Indoor',  status: 'occupied', openedAt: _hm(21, 0), currentTotal: 215 },
  { id: 't7',  number: 7,  capacity: 4, section: 'Indoor',  status: 'ordering', openedAt: _hm(21,45), currentTotal: 36  },
  { id: 't8',  number: 8,  capacity: 6, section: 'Indoor',  status: 'free',     currentTotal: 0 },
  { id: 't9',  number: 9,  capacity: 4, section: 'Beach',   status: 'occupied', openedAt: _hm(20, 0), currentTotal: 310 },
  { id: 't10', number: 10, capacity: 6, section: 'Beach',   status: 'occupied', openedAt: _hm(21,30), currentTotal: 68  },
  { id: 't11', number: 11, capacity: 2, section: 'Beach',   status: 'free',     currentTotal: 0 },
  { id: 't12', number: 12, capacity: 8, section: 'Beach',   status: 'ordering', openedAt: _hm(22, 0), currentTotal: 52  },
];

const DEMO_ORDERS: OrderData[] = [
  {
    id: 'do1', tableId: 't3', tableNumber: 3, destination: 'bar', status: 'new',
    items: [
      { name: 'Mojito',        qty: 2, price: 12, modifiers: ['Extra Mint'] },
      { name: 'Aperol Spritz', qty: 1, price: 10 },
    ],
    total: 34, createdAt: _ago(2), staffName: 'Alex',
  },
  {
    id: 'do2', tableId: 't7', tableNumber: 7, destination: 'bar', status: 'new',
    items: [
      { name: 'Espresso Martini', qty: 2, price: 13, modifiers: ['Double Shot'] },
      { name: 'Margarita',        qty: 1, price: 12 },
    ],
    total: 38, createdAt: _ago(1), staffName: 'Maria',
  },
  {
    id: 'do3', tableId: 't12', tableNumber: 12, destination: 'bar', status: 'new',
    items: [
      { name: 'Piña Colada',  qty: 3, price: 11 },
      { name: 'Sex on Beach', qty: 1, price: 10 },
    ],
    total: 43, createdAt: _ago(0), staffName: 'Alex',
  },
  {
    id: 'do4', tableId: 't1', tableNumber: 1, destination: 'bar', status: 'in_progress',
    items: [
      { name: 'Old Fashioned', qty: 2, price: 14 },
      { name: 'Negroni',       qty: 1, price: 13 },
    ],
    total: 41, createdAt: _ago(7), staffName: 'Alex',
  },
  {
    id: 'do5', tableId: 't6', tableNumber: 6, destination: 'bar', status: 'in_progress',
    items: [
      { name: 'Mojito', qty: 4, price: 12, modifiers: ['No Sugar'] },
    ],
    total: 48, createdAt: _ago(9), staffName: 'Maria',
  },
  {
    id: 'do6', tableId: 't4', tableNumber: 4, destination: 'bar', status: 'ready',
    items: [
      { name: 'Espresso Martini', qty: 2, price: 13 },
      { name: 'Aperol Spritz',    qty: 2, price: 10 },
    ],
    total: 46, createdAt: _ago(14), staffName: 'Alex',
  },
  {
    id: 'do7', tableId: 't9', tableNumber: 9, destination: 'bar', status: 'ready',
    items: [
      { name: 'Long Island Iced Tea', qty: 1, price: 15 },
      { name: 'Mojito',              qty: 2, price: 12 },
    ],
    total: 39, createdAt: _ago(11), staffName: 'Maria',
  },
];

// ─── Supabase mappers ─────────────────────────────────────────
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

// ─── NestJS mappers ───────────────────────────────────────────
const nestStatusToStore = (s: string): OrderStatus => {
  if (s === 'pending' || s === 'sent') return 'new';
  if (s === 'in_progress') return 'in_progress';
  if (s === 'ready') return 'ready';
  return 'delivered';
};
const storeStatusToNest = (s: OrderStatus): string =>
  s === 'new' ? 'sent' : s;

const mapNestTable = (row: any): TableData => ({
  id: row.id, number: row.number, capacity: row.capacity || 4,
  section: row.section || 'Main', status: row.status || 'free',
  openedAt: undefined, currentTotal: 0,
});

const mapNestOrder = (row: any): OrderData => ({
  id: row.id, tableId: row.tableId || null,
  tableNumber: row.table?.number || 0,
  items: (row.items || []).map((i: any) => ({
    name: i.productName, qty: i.quantity, price: Number(i.unitPrice),
    modifiers: (i.selectedModifiers || []).map((m: any) => m.optionName).filter(Boolean),
    note: i.customNote || undefined,
  })),
  status: nestStatusToStore(row.status),
  destination: row.destination === 'kitchen' ? 'kitchen' : 'bar',
  total: Number(row.total), createdAt: row.createdAt, staffName: 'Staff',
});

// ─── Store interface ──────────────────────────────────────────
interface DemoStore {
  loading:    boolean;
  submitting: boolean;
  initialized: boolean;
  staff:      StaffMember | null;
  isOnline:   boolean;
  pendingSyncCount: number;

  tables: TableData[];
  orders: OrderData[];
  cart:   CartItem[];

  activeTableId: string | null;
  modifierItem:  MenuItem | null;
  notification:  { message: string; type: 'success' | 'info' | 'error' } | null;

  initStore:           () => Promise<void>;
  setOnline:           (v: boolean) => void;
  setPendingSyncCount: (n: number) => void;
  syncOfflineOrders:   () => Promise<void>;

  login:   (pin: string) => Promise<StaffMember | null>;
  logout:  () => void;
  setStaff:(staff: StaffMember | null) => void;

  updateTableStatus: (id: string, status: TableStatus) => void;
  setActiveTable:    (id: string | null) => void;

  addToCart:      (item: MenuItem, modifiers?: ModifierOption[], note?: string, silent?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQty:      (id: string, qty: number) => void;
  clearCart:      () => void;

  submitOrder:       (tableId: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;

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
  isOnline:    true,
  pendingSyncCount: 0,
  tables:      [],
  orders:      [],
  cart:        [],
  activeTableId: null,
  modifierItem:  null,
  notification:  null,

  // ── Online / Offline state ────────────────────────────────
  setOnline: (v) => set({ isOnline: v }),
  setPendingSyncCount: (n) => set({ pendingSyncCount: n }),

  // ── Lifecycle ─────────────────────────────────────────────
  initStore: async () => {
    if (get().initialized) return;
    set({ loading: true });

    // Detect initial online state
    if (typeof navigator !== 'undefined') {
      set({ isOnline: navigator.onLine });
    }

    // Load pending offline count from IndexedDB
    try {
      const count = await getPendingOrderCount(BUSINESS_ID);
      set({ pendingSyncCount: count });
    } catch (_) { /* IndexedDB not available */ }

    try {
      if (USE_NEST) {
        const [tablesRes, ordersRes] = await Promise.all([
          tablesApi.getAll(),
          ordersApi.getAll(),
        ]);
        set({
          tables: (tablesRes || []).map(mapNestTable),
          orders: (ordersRes || []).map(mapNestOrder),
          loading: false, initialized: true,
        });
      } else {
        const [{ data: tableRows }, { data: orderRows }] = await Promise.all([
          supabase.from('floor_tables').select('*').order('number'),
          supabase.from('orders').select('*').neq('status', 'delivered').order('created_at', { ascending: false }),
        ]);
        set({
          tables: (tableRows || []).map(mapSupabaseTable),
          orders: (orderRows || []).map(mapSupabaseOrder),
          loading: false, initialized: true,
        });
      }
    } catch (err) {
      console.error('initStore failed (possibly offline):', err);
      set({ loading: false, initialized: true });
    }

    // If no backend returned data, seed with demo data so the UI
    // is fully populated for demos / pitches without a live backend.
    if (get().tables.length === 0) {
      set({ tables: DEMO_TABLES, orders: DEMO_ORDERS });
    }

    _subscribeSupabaseRealtime();
  },

  // ── Sync offline orders ───────────────────────────────────
  syncOfflineOrders: async () => {
    const pending = await getPendingOrders(BUSINESS_ID);
    if (pending.length === 0) return;

    console.log(`[BarFlow Sync] Syncing ${pending.length} offline order(s)...`);
    let synced    = 0;
    let abandoned = 0;

    for (const order of pending) {
      // Skip orders that have already hit the retry cap.
      if (order.retryCount >= MAX_RETRY) {
        console.warn(`[Sync] Abandoning order ${order.localId} (${order.retryCount} retries)`);
        await writeSyncLog(order.localId, 'failed', 'Max retries exceeded');
        await removePendingOrder(order.localId);
        abandoned++;
        continue;
      }

      try {
        // Parse destination/tableNumber from notes metadata
        let destination: 'bar' | 'kitchen' = 'bar';
        let tableNumber = 0;
        try {
          const meta = JSON.parse(order.notes || '{}');
          destination = meta.destination || 'bar';
          tableNumber = meta.tableNumber || 0;
        } catch (_) {}

        if (USE_NEST) {
          await ordersApi.create({
            tableId:     order.tableId,
            localId:     order.localId,
            destination,
            items: order.items.map(i => ({
              productName: i.productName,
              unitPrice:   i.unitPrice,
              quantity:    i.quantity,
              selectedModifiers: i.selectedModifiers?.map((m: any) => ({
                groupId: 'custom', groupName: 'Modifiers',
                optionId:       m.id || m.optionId || 'mod',
                optionName:     m.name || m.optionName || '',
                priceAdjustment: m.priceAdjustment || 0,
              })) || [],
              customNote: i.customNote,
            })),
          });
        } else {
          await supabase.from('orders').insert({
            table_id:     order.tableId || null,
            table_number: tableNumber,
            destination,
            status:       'new',
            total:        order.items.reduce((s, i) => s + i.totalPrice, 0),
            staff_name:   get().staff?.name || 'Staff',
            items:        order.items.map(i => ({
              name:  i.productName,
              qty:   i.quantity,
              price: i.unitPrice,
            })),
          });
        }

        await writeSyncLog(order.localId, 'synced');
        await removePendingOrder(order.localId);
        synced++;
      } catch (err) {
        console.error(`[Sync] Failed order ${order.localId}:`, err);
        // Increment retry counter — abandon at MAX_RETRY on the next sync attempt.
        await incrementRetryCount(order.localId);
      }
    }

    const remaining = await getPendingOrderCount(BUSINESS_ID);
    set({ pendingSyncCount: remaining });

    if (synced > 0) {
      get().showNotification(
        `✅ Synced ${synced} offline order${synced !== 1 ? 's' : ''}`,
        'success',
      );
    }
    if (abandoned > 0) {
      console.warn(`[Sync] Abandoned ${abandoned} order(s) after ${MAX_RETRY} failed attempts.`);
    }
  },

  // ── Auth ──────────────────────────────────────────────────
  login: async (pin) => {
    // ── Local demo PIN lookup (always available as fallback) ──
    const DEMO_PINS: Record<string, StaffMember> = {
      '0000': { id: 'demo-owner',   name: 'Owner',   role: 'manager', emoji: '👑' },
      '1111': { id: 'demo-owner2',  name: 'Owner',   role: 'manager', emoji: '👑' },
      '1234': { id: 'demo-alex',    name: 'Alex',    role: 'bar',     emoji: '🍹' },
      '5678': { id: 'demo-maria',   name: 'Maria',   role: 'kitchen', emoji: '👨‍🍳' },
      '9999': { id: 'demo-manager', name: 'Manager', role: 'manager', emoji: '📊' },
    };

    if (USE_NEST) {
      try {
        const { accessToken, user } = await import('@/lib/api').then(m =>
          m.authApi.pinLogin(BUSINESS_ID, pin)
        );
        if (typeof window !== 'undefined') localStorage.setItem('barflow_token', accessToken);
        const member: StaffMember = { id: user.id, name: user.name, role: user.role, emoji: '👤' };
        set({ staff: member });
        return member;
      } catch {
        // NestJS unavailable — fall through to demo PIN lookup
      }
    } else if (HAS_SUPABASE) {
      try {
        const { data } = await supabase
          .from('staff').select('id, name, role, emoji')
          .eq('pin', pin).eq('is_active', true).single();
        if (data) {
          const member: StaffMember = { id: data.id, name: data.name, role: data.role, emoji: data.emoji };
          set({ staff: member });
          return member;
        }
      } catch {
        // Supabase unavailable — fall through to demo PIN lookup
      }
    }

    // Demo / offline fallback — accept hardcoded PINs
    const demo = DEMO_PINS[pin];
    if (demo) {
      set({ staff: demo });
      return demo;
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
  addToCart: (menuItem, modifiers = [], note = '', silent = false) => {
    const { cart } = get();
    const modTotal  = modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
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
      set({
        cart: [
          ...cart,
          { id: uuidv4(), menuItem, quantity: 1, selectedModifiers: modifiers, customNote: note, totalPrice: unitPrice },
        ],
      });
    }

    // Only show toast for customized items (from modifier panel) or explicit non-silent adds.
    // Direct taps are silent by default — cart count badge gives instant feedback instead.
    if (!silent) {
      const modSuffix = modifiers.length > 0 ? ` (${modifiers.length} mod${modifiers.length > 1 ? 's' : ''})` : '';
      get().showNotification(`✓ ${menuItem.name}${modSuffix} added`, 'success');
    }
  },

  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(c => c.id !== id) })),

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
    const { cart, tables, staff, isOnline } = get();
    if (cart.length === 0) return;
    set({ submitting: true });

    const table    = tables.find(t => t.id === tableId);
    // Route by category destination — not by hardcoded categoryId string
    const barItems  = cart.filter(c => getCategoryDestination(c.menuItem.categoryId) === 'bar');
    const foodItems = cart.filter(c => getCategoryDestination(c.menuItem.categoryId) === 'kitchen');
    const isWalkin  = tableId === 'walkin';
    const total     = cart.reduce((s, c) => s + c.totalPrice, 0);

    try {
      // ── OFFLINE PATH ──────────────────────────────────────
      if (!isOnline) {
        const buildOfflineItems = (items: CartItem[]) => items.map(c => ({
          productId:   c.menuItem.id,
          productName: c.menuItem.name,
          quantity:    c.quantity,
          selectedModifiers: c.selectedModifiers,
          customNote:  c.customNote || undefined,
          unitPrice:   c.menuItem.price + c.selectedModifiers.reduce((s, m) => s + m.priceAdjustment, 0),
          totalPrice:  c.totalPrice,
        }));

        const now = new Date().toISOString();
        const tId = isWalkin ? undefined : tableId;

        if (barItems.length > 0) {
          await savePendingOrder(BUSINESS_ID, {
            tableId: tId,
            items:   buildOfflineItems(barItems),
            notes:   JSON.stringify({ destination: 'bar', tableNumber: table?.number || 0 }),
          });
          // Optimistic local order
          set(s => ({ orders: [{ id: uuidv4(), tableId: tId || null, tableNumber: table?.number || 0,
            items: barItems.map(c => ({ name: c.menuItem.name, qty: c.quantity, price: c.menuItem.price })),
            status: 'new', destination: 'bar', total: barItems.reduce((s, c) => s + c.totalPrice, 0),
            createdAt: now, staffName: staff?.name || 'Staff', isOffline: true,
          }, ...s.orders] }));
        }

        if (foodItems.length > 0) {
          await savePendingOrder(BUSINESS_ID, {
            tableId: tId,
            items:   buildOfflineItems(foodItems),
            notes:   JSON.stringify({ destination: 'kitchen', tableNumber: table?.number || 0 }),
          });
          set(s => ({ orders: [{ id: uuidv4(), tableId: tId || null, tableNumber: table?.number || 0,
            items: foodItems.map(c => ({ name: c.menuItem.name, qty: c.quantity, price: c.menuItem.price })),
            status: 'new', destination: 'kitchen', total: foodItems.reduce((s, c) => s + c.totalPrice, 0),
            createdAt: now, staffName: staff?.name || 'Staff', isOffline: true,
          }, ...s.orders] }));
        }

        const count = await getPendingOrderCount(BUSINESS_ID);
        set({ cart: [], submitting: false, pendingSyncCount: count });
        get().showNotification('📡 Saved offline — will sync when connected', 'info');
        return;
      }

      // ── ONLINE PATH ───────────────────────────────────────
      if (USE_NEST) {
        const buildNestItems = (items: CartItem[]) => items.map(c => ({
          productName: c.menuItem.name,
          unitPrice:   c.menuItem.price,
          quantity:    c.quantity,
          selectedModifiers: c.selectedModifiers.map(m => ({
            groupId: 'custom', groupName: 'Modifiers',
            optionId: m.id, optionName: m.name, priceAdjustment: m.priceAdjustment,
          })),
          customNote: c.customNote || undefined,
        }));

        const sends: Promise<any>[] = [];
        const tId = isWalkin ? undefined : tableId;
        if (barItems.length  > 0) sends.push(ordersApi.create({ tableId: tId, localId: uuidv4(), destination: 'bar',     items: buildNestItems(barItems)  }));
        if (foodItems.length > 0) sends.push(ordersApi.create({ tableId: tId, localId: uuidv4(), destination: 'kitchen', items: buildNestItems(foodItems) }));
        await Promise.all(sends);

        if (!isWalkin) {
          set(s => ({ tables: s.tables.map(t => t.id === tableId ? { ...t, status: 'occupied' as TableStatus } : t) }));
        }
      } else {
        const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const buildOrder = (items: CartItem[], destination: 'bar' | 'kitchen') => ({
          table_id:     isWalkin ? null : tableId,
          table_number: table?.number || 0,
          destination, status: 'new',
          total:        items.reduce((s, c) => s + c.totalPrice, 0),
          staff_name:   staff?.name || 'Staff',
          items: items.map(c => ({
            name: c.menuItem.name, qty: c.quantity, price: c.menuItem.price,
            modifiers: c.selectedModifiers.map(m => m.name),
            note: c.customNote || undefined,
          })),
        });

        if (barItems.length  > 0) await supabase.from('orders').insert(buildOrder(barItems,  'bar'));
        if (foodItems.length > 0) await supabase.from('orders').insert(buildOrder(foodItems, 'kitchen'));

        if (!isWalkin && tableId) {
          await supabase.from('floor_tables').update({
            status: 'occupied', opened_at: table?.openedAt || now,
            current_total: (table?.currentTotal || 0) + total,
          }).eq('id', tableId);
        }
      }

      set({ cart: [], submitting: false });
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
    } catch (err) { console.error('updateOrderStatus failed:', err); }
  },

  // ── Modifier panel ────────────────────────────────────────
  openModifierPanel:  (item) => set({ modifierItem: item }),
  closeModifierPanel: ()     => set({ modifierItem: null }),

  // ── Notifications ─────────────────────────────────────────
  showNotification: (message, type = 'info') => {
    // Cancel any existing timer before setting a new notification
    if (_notifTimer) {
      clearTimeout(_notifTimer);
      _notifTimer = null;
    }
    set({ notification: { message, type } });
    _notifTimer = setTimeout(() => {
      set({ notification: null });
      _notifTimer = null;
    }, 2500);
  },
  clearNotification: () => set({ notification: null }),
}));

// ─── Supabase Realtime subscriptions ─────────────────────────
/**
 * Subscribes to live order and table updates via Supabase Realtime.
 * Only fires when NEXT_PUBLIC_SUPABASE_URL/KEY are configured (HAS_SUPABASE).
 * Channel refs are stored module-level so they can be unsubscribed.
 */
function _subscribeSupabaseRealtime() {
  if (!HAS_SUPABASE) return; // no-op in demo / NestJS-only mode

  // Tear down any existing channels first (guards against HMR double-subscribe).
  _unsubscribeSupabaseRealtime();

  _ordersChan = supabase
    .channel('orders-live')
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
    });
  _ordersChan.subscribe();

  _tablesChan = supabase
    .channel('tables-live')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'floor_tables' }, ({ new: row }) => {
      useDemoStore.setState(s => ({ tables: s.tables.map(t => t.id === row.id ? mapSupabaseTable(row) : t) }));
    });
  _tablesChan.subscribe();
}

function _unsubscribeSupabaseRealtime() {
  if (_ordersChan) { supabase.removeChannel(_ordersChan); _ordersChan = null; }
  if (_tablesChan) { supabase.removeChannel(_tablesChan); _tablesChan = null; }
}
