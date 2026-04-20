// ============================================================
// BarFlow — Mock Tables + Orders Data
// ============================================================

export type TableStatus = 'free' | 'occupied' | 'ordering';

export interface TableData {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  section: string;
  currentTotal?: number;
  openedAt?: string;
  guestCount?: number;
}

export type OrderStatus = 'new' | 'in_progress' | 'ready' | 'delivered';

export interface OrderData {
  id: string;
  tableId: string;
  tableNumber: number;
  status: OrderStatus;
  destination: 'bar' | 'kitchen';
  items: { name: string; qty: number; note?: string; modifiers?: string[] }[];
  total: number;
  createdAt: string;
  staffName?: string;
}

// ─── Tables ──────────────────────────────────────────────────
export const MOCK_TABLES: TableData[] = [
  { id: 't1',  number: 1,  capacity: 2, status: 'free',     section: 'Indoor' },
  { id: 't2',  number: 2,  capacity: 2, status: 'occupied', section: 'Indoor', currentTotal: 42.50, openedAt: '21:10', guestCount: 2 },
  { id: 't3',  number: 3,  capacity: 4, status: 'free',     section: 'Indoor' },
  { id: 't4',  number: 4,  capacity: 4, status: 'ordering', section: 'Indoor', currentTotal: 28.00, openedAt: '21:32', guestCount: 3 },
  { id: 't5',  number: 5,  capacity: 4, status: 'occupied', section: 'Indoor', currentTotal: 86.00, openedAt: '20:45', guestCount: 4 },
  { id: 't6',  number: 6,  capacity: 4, status: 'free',     section: 'Indoor' },
  { id: 't7',  number: 7,  capacity: 6, status: 'free',     section: 'Indoor' },
  { id: 't8',  number: 8,  capacity: 4, status: 'occupied', section: 'Indoor', currentTotal: 55.00, openedAt: '21:05', guestCount: 3 },
  { id: 't9',  number: 9,  capacity: 4, status: 'free',     section: 'Indoor' },
  { id: 't10', number: 10, capacity: 6, status: 'occupied', section: 'Indoor', currentTotal: 124.00, openedAt: '20:30', guestCount: 6 },
  { id: 't11', number: 11, capacity: 6, status: 'free',     section: 'Terrace' },
  { id: 't12', number: 12, capacity: 4, status: 'ordering', section: 'Terrace', currentTotal: 17.50, openedAt: '21:40', guestCount: 2 },
  { id: 't13', number: 13, capacity: 4, status: 'occupied', section: 'Terrace', currentTotal: 66.00, openedAt: '21:00', guestCount: 4 },
  { id: 't14', number: 14, capacity: 4, status: 'free',     section: 'Terrace' },
  { id: 't15', number: 15, capacity: 4, status: 'free',     section: 'Terrace' },
  { id: 't16', number: 16, capacity: 6, status: 'occupied', section: 'Terrace', currentTotal: 93.00, openedAt: '20:55', guestCount: 5 },
  { id: 't17', number: 17, capacity: 8, status: 'free',     section: 'Beach' },
  { id: 't18', number: 18, capacity: 8, status: 'occupied', section: 'Beach', currentTotal: 180.00, openedAt: '20:20', guestCount: 8 },
  { id: 't19', number: 19, capacity: 6, status: 'ordering', section: 'Beach', currentTotal: 45.00, openedAt: '21:35', guestCount: 4 },
  { id: 't20', number: 20, capacity: 6, status: 'free',     section: 'Beach' },
];

// ─── Demo Orders ─────────────────────────────────────────────
export const MOCK_ORDERS: OrderData[] = [
  {
    id: 'o1', tableId: 't4', tableNumber: 4,
    status: 'new', destination: 'bar',
    items: [
      { name: 'Mojito', qty: 2, modifiers: ['Extra Rum', 'No Sugar'] },
      { name: 'Aperol Spritz', qty: 1 },
    ],
    total: 29.00, createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    staffName: 'Ana',
  },
  {
    id: 'o2', tableId: 't2', tableNumber: 2,
    status: 'in_progress', destination: 'bar',
    items: [
      { name: 'Espresso Martini', qty: 1 },
      { name: 'Negroni', qty: 1 },
    ],
    total: 23.00, createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    staffName: 'Marco',
  },
  {
    id: 'o3', tableId: 't10', tableNumber: 10,
    status: 'new', destination: 'kitchen',
    items: [
      { name: 'Beach Burger', qty: 2, note: 'One medium rare' },
      { name: 'Greek Salad', qty: 1 },
    ],
    total: 37.00, createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    staffName: 'Lena',
  },
  {
    id: 'o4', tableId: 't5', tableNumber: 5,
    status: 'ready', destination: 'bar',
    items: [
      { name: 'Long Island', qty: 2 },
      { name: 'Heineken 0.5L', qty: 2 },
    ],
    total: 36.00, createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    staffName: 'Ana',
  },
  {
    id: 'o5', tableId: 't13', tableNumber: 13,
    status: 'in_progress', destination: 'kitchen',
    items: [
      { name: 'Nachos', qty: 2 },
      { name: 'Club Sandwich', qty: 1 },
    ],
    total: 32.00, createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    staffName: 'Marco',
  },
  {
    id: 'o6', tableId: 't19', tableNumber: 19,
    status: 'new', destination: 'bar',
    items: [
      { name: 'Tequila Shot', qty: 4 },
      { name: 'Jägerbomb', qty: 2 },
    ],
    total: 34.00, createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
    staffName: 'Lena',
  },
  {
    id: 'o7', tableId: 't16', tableNumber: 16,
    status: 'ready', destination: 'kitchen',
    items: [
      { name: 'Bruschetta', qty: 2 },
    ],
    total: 14.00, createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    staffName: 'Ana',
  },
];

// ─── Manager Stats ────────────────────────────────────────────
export const MANAGER_STATS = {
  todayRevenue:  1847.50,
  ordersCount:   82,
  avgOrderValue: 22.53,
  topItems: [
    { name: 'Mojito',          count: 34, revenue: 340.00 },
    { name: 'Aperol Spritz',   count: 28, revenue: 252.00 },
    { name: 'Espresso Martini',count: 24, revenue: 288.00 },
    { name: 'Heineken 0.5L',   count: 22, revenue: 110.00 },
    { name: 'Beach Burger',    count: 18, revenue: 252.00 },
  ],
  lowStock: [
    { name: 'Aperol',   current: '1.2L', minimum: '2L',  level: 0.3 },
    { name: 'Prosecco', current: '2btl', minimum: '4btl', level: 0.5 },
    { name: 'Mint',     current: '40g',  minimum: '100g', level: 0.4 },
  ],
  hourlyRevenue: [120, 85, 95, 140, 180, 220, 310, 380, 317],
};
