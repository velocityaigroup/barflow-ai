/**
 * BarFlow Global State — Zustand store
 * Single source of truth for the POS app.
 */
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  selectedModifiers: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceAdjustment: number;
  }[];
  customNote?: string;
  totalPrice: number;
  destination: 'bar' | 'kitchen';
}

export interface TableState {
  id: string;
  name: string;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'ordering';
  section?: string;
  positionX?: number;
  positionY?: number;
  currentOrderId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  destination: 'bar' | 'kitchen';
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isAlcohol: boolean;
  modifierGroups?: any[];
}

export interface ActiveOrder {
  id?: string;
  tableId?: string;
  tableName?: string;
  items: CartItem[];
  status: 'pending' | 'sent' | 'in_progress' | 'ready' | 'delivered';
  destination: 'bar' | 'kitchen' | 'mixed';
  total: number;
  createdAt: string;
}

export interface BarFlowState {
  // Auth
  user: { id: string; name: string; role: string; businessId: string } | null;
  token: string | null;

  // Connection
  isOnline: boolean;
  pendingSyncCount: number;
  wsConnected: boolean;

  // Floor
  tables: TableState[];
  selectedTableId: string | null;

  // Menu
  categories: Category[];
  products: Product[];
  activeCategoryId: string | null;

  // Cart
  cart: CartItem[];
  cartTableId: string | null;

  // Live orders (bar/kitchen view)
  liveOrders: ActiveOrder[];

  // Manager
  dailyRevenue: number;
  topItems: { name: string; count: number; revenue: number }[];

  // Actions
  setUser: (user: BarFlowState['user'], token: string) => void;
  logout: () => void;
  setOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setWsConnected: (connected: boolean) => void;

  setTables: (tables: TableState[]) => void;
  updateTableStatus: (id: string, status: TableState['status']) => void;
  selectTable: (id: string | null) => void;

  setCategories: (cats: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setActiveCategory: (id: string | null) => void;

  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setCartTable: (tableId: string | null) => void;
  get cartTotal(): number;
  get cartItemCount(): number;

  setLiveOrders: (orders: ActiveOrder[]) => void;
  addLiveOrder: (order: ActiveOrder) => void;
  updateLiveOrderStatus: (id: string, status: ActiveOrder['status']) => void;

  setDailyRevenue: (total: number, topItems: any[]) => void;
}

export const useBarFlowStore = create<BarFlowState>((set, get) => ({
  // Auth
  user: null,
  token: null,

  // Connection
  isOnline: true,
  pendingSyncCount: 0,
  wsConnected: false,

  // Floor
  tables: [],
  selectedTableId: null,

  // Menu
  categories: [],
  products: [],
  activeCategoryId: null,

  // Cart
  cart: [],
  cartTableId: null,

  // Live orders
  liveOrders: [],

  // Manager
  dailyRevenue: 0,
  topItems: [],

  // ─── Auth ──────────────────────────────────────────────────
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('barflow_token', token);
      localStorage.setItem('barflow_user', JSON.stringify(user));
    }
    set({ user, token });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('barflow_token');
      localStorage.removeItem('barflow_user');
    }
    set({ user: null, token: null, cart: [], selectedTableId: null });
  },

  // ─── Connection ────────────────────────────────────────────
  setOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
  setWsConnected: (wsConnected) => set({ wsConnected }),

  // ─── Tables ────────────────────────────────────────────────
  setTables: (tables) => set({ tables }),
  updateTableStatus: (id, status) =>
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  selectTable: (selectedTableId) => set({ selectedTableId }),

  // ─── Menu ──────────────────────────────────────────────────
  setCategories: (categories) =>
    set({ categories, activeCategoryId: categories[0]?.id || null }),
  setProducts: (products) => set({ products }),
  setActiveCategory: (activeCategoryId) => set({ activeCategoryId }),

  // ─── Cart ──────────────────────────────────────────────────
  addToCart: (item) => {
    const { cart } = get();
    // Check if same product+modifiers already in cart
    const existing = cart.find(
      (c) =>
        c.productId === item.productId &&
        JSON.stringify(c.selectedModifiers) === JSON.stringify(item.selectedModifiers) &&
        c.customNote === item.customNote,
    );

    if (existing) {
      set({
        cart: cart.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                quantity: c.quantity + item.quantity,
                totalPrice: c.totalPrice + item.totalPrice,
              }
            : c,
        ),
      });
    } else {
      set({ cart: [...cart, { ...item, id: uuidv4() }] });
    }
  },

  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),

  updateCartItemQty: (id, qty) =>
    set((s) => ({
      cart: s.cart
        .map((c) =>
          c.id === id
            ? { ...c, quantity: qty, totalPrice: c.productPrice * qty }
            : c,
        )
        .filter((c) => c.quantity > 0),
    })),

  clearCart: () => set({ cart: [], cartTableId: null }),
  setCartTable: (cartTableId) => set({ cartTableId }),

  get cartTotal() {
    return get().cart.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  get cartItemCount() {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // ─── Live Orders ───────────────────────────────────────────
  setLiveOrders: (liveOrders) => set({ liveOrders }),
  addLiveOrder: (order) =>
    set((s) => ({ liveOrders: [order, ...s.liveOrders] })),
  updateLiveOrderStatus: (id, status) =>
    set((s) => ({
      liveOrders: s.liveOrders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),

  // ─── Manager ───────────────────────────────────────────────
  setDailyRevenue: (dailyRevenue, topItems) => set({ dailyRevenue, topItems }),
}));
