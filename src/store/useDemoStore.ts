'use client';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_TABLES, MOCK_ORDERS, TableData, TableStatus, OrderData, OrderStatus } from '@/data/tables';
import { MenuItem, ModifierOption } from '@/data/menu';

// ─── Cart types ───────────────────────────────────────────────
export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: ModifierOption[];
  customNote: string;
  totalPrice: number;
}

// ─── Store ────────────────────────────────────────────────────
interface DemoStore {
  // Tables
  tables: TableData[];
  updateTableStatus: (id: string, status: TableStatus) => void;

  // Active order context
  activeTableId: string | null;
  setActiveTable: (id: string | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, modifiers?: ModifierOption[], note?: string) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;

  // Orders
  orders: OrderData[];
  submitOrder: (tableId: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Modifier panel state
  modifierItem: MenuItem | null;
  openModifierPanel: (item: MenuItem) => void;
  closeModifierPanel: () => void;

  // Notification
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
  clearNotification: () => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
  // ─── Tables ──────────────────────────────────────────────
  tables: MOCK_TABLES,
  updateTableStatus: (id, status) =>
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  // ─── Active context ──────────────────────────────────────
  activeTableId: null,
  setActiveTable: (id) => set({ activeTableId: id, cart: [] }),

  // ─── Cart ────────────────────────────────────────────────
  cart: [],

  addToCart: (menuItem, modifiers = [], note = '') => {
    const { cart } = get();

    // Try to merge with identical existing item
    const existingIdx = cart.findIndex(
      (c) =>
        c.menuItem.id === menuItem.id &&
        JSON.stringify(c.selectedModifiers.map((m) => m.id).sort()) ===
          JSON.stringify(modifiers.map((m) => m.id).sort()) &&
        c.customNote === note,
    );

    const modTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
    const unitPrice = menuItem.price + modTotal;

    if (existingIdx !== -1) {
      set({
        cart: cart.map((c, i) =>
          i === existingIdx
            ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * unitPrice }
            : c,
        ),
      });
    } else {
      const newItem: CartItem = {
        id: uuidv4(),
        menuItem,
        quantity: 1,
        selectedModifiers: modifiers,
        customNote: note,
        totalPrice: unitPrice,
      };
      set({ cart: [...cart, newItem] });
    }

    get().showNotification(`${menuItem.name} added`, 'success');
  },

  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),

  updateQty: (id, qty) =>
    set((s) => ({
      cart: s.cart
        .map((c) => {
          if (c.id !== id) return c;
          const unitPrice = (c.menuItem.price + c.selectedModifiers.reduce((sum, m) => sum + m.priceAdjustment, 0));
          return { ...c, quantity: qty, totalPrice: qty * unitPrice };
        })
        .filter((c) => c.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  // ─── Orders ──────────────────────────────────────────────
  orders: MOCK_ORDERS,

  submitOrder: (tableId) => {
    const { cart, tables, orders, showNotification } = get();
    if (cart.length === 0) return;

    const table = tables.find((t) => t.id === tableId);
    const barItems  = cart.filter((c) => !c.menuItem.categoryId.includes('food'));
    const foodItems = cart.filter((c) => c.menuItem.categoryId.includes('food'));

    const newOrders: OrderData[] = [];
    const total = cart.reduce((sum, c) => sum + c.totalPrice, 0);

    if (barItems.length > 0) {
      newOrders.push({
        id: uuidv4(),
        tableId,
        tableNumber: table?.number || 0,
        status: 'new',
        destination: 'bar',
        items: barItems.map((c) => ({
          name: c.menuItem.name,
          qty: c.quantity,
          note: c.customNote || undefined,
          modifiers: c.selectedModifiers.map((m) => m.name),
        })),
        total: barItems.reduce((sum, c) => sum + c.totalPrice, 0),
        createdAt: new Date().toISOString(),
        staffName: 'Demo Staff',
      });
    }

    if (foodItems.length > 0) {
      newOrders.push({
        id: uuidv4(),
        tableId,
        tableNumber: table?.number || 0,
        status: 'new',
        destination: 'kitchen',
        items: foodItems.map((c) => ({
          name: c.menuItem.name,
          qty: c.quantity,
          note: c.customNote || undefined,
          modifiers: [],
        })),
        total: foodItems.reduce((sum, c) => sum + c.totalPrice, 0),
        createdAt: new Date().toISOString(),
        staffName: 'Demo Staff',
      });
    }

    set({
      orders: [...newOrders, ...orders],
      cart: [],
      tables: tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupied',
              currentTotal: (t.currentTotal || 0) + total,
              openedAt: t.openedAt || new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
            }
          : t,
      ),
    });

    showNotification(
      `Order sent! ${barItems.length > 0 ? '🍹 Bar' : ''}${barItems.length > 0 && foodItems.length > 0 ? ' + ' : ''}${foodItems.length > 0 ? '🍽️ Kitchen' : ''}`,
      'success',
    );
  },

  updateOrderStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),

  // ─── Modifier panel ───────────────────────────────────────
  modifierItem: null,
  openModifierPanel: (item) => set({ modifierItem: item }),
  closeModifierPanel: () => set({ modifierItem: null }),

  // ─── Notification ─────────────────────────────────────────
  notification: null,
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 2000);
  },
  clearNotification: () => set({ notification: null }),
}));
