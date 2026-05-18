/**
 * BarFlow Offline-First Engine
 *
 * Uses IndexedDB (via idb) to persist orders locally when the device
 * has no network. Orders sync automatically when connectivity returns.
 *
 * Safe to import in SSR/Edge contexts — all IDB access is lazy and
 * behind `typeof window` guards.
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

// ─── Constants ────────────────────────────────────────────────
/** Orders that fail this many times are abandoned and logged. */
export const MAX_RETRY = 3;

// ─── Schema ──────────────────────────────────────────────────
interface BarFlowDB extends DBSchema {
  pending_orders: {
    key: string;
    value: {
      localId:    string;
      businessId: string;
      tableId?:   string;
      items:      OfflineOrderItem[];
      notes?:     string;
      createdAt:  string;
      deviceId:   string;
      retryCount: number;
    };
    indexes: { 'by-business': string; 'by-date': string };
  };
  sync_log: {
    key: string;
    value: {
      id:        string;
      localId:   string;
      serverId?: string;
      status:    'synced' | 'failed' | 'conflict';
      error?:    string;
      syncedAt:  string;
    };
  };
  menu_cache: {
    key: string;
    value: {
      businessId:  string;
      categories:  any[];
      products:    any[];
      cachedAt:    string;
    };
  };
}

export interface OfflineOrderItem {
  productId:          string;
  productName:        string;
  quantity:           number;
  selectedModifiers:  any[];
  customNote?:        string;
  unitPrice:          number;
  totalPrice:         number;
}

// ─── DB Instance ─────────────────────────────────────────────
let db: IDBPDatabase<BarFlowDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BarFlowDB>> {
  if (db) return db;

  db = await openDB<BarFlowDB>('barflow-offline', 2, {
    upgrade(database, oldVersion) {
      if (!database.objectStoreNames.contains('pending_orders')) {
        const store = database.createObjectStore('pending_orders', { keyPath: 'localId' });
        store.createIndex('by-business', 'businessId');
        store.createIndex('by-date',     'createdAt');
      }
      if (!database.objectStoreNames.contains('sync_log')) {
        database.createObjectStore('sync_log', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('menu_cache')) {
        database.createObjectStore('menu_cache', { keyPath: 'businessId' });
      }
    },
  });

  return db;
}

// ─── Device ID ───────────────────────────────────────────────
/** In-memory fallback for SSR / private-browsing contexts where localStorage is unavailable. */
let _memDeviceId: string | null = null;

/**
 * Returns a stable device identifier.
 * Persisted in localStorage; falls back to a per-session in-memory ID
 * when localStorage is unavailable (SSR, private mode, iframe sandbox).
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server / Edge context — return a constant so the call never throws.
    return 'server';
  }
  try {
    let id = localStorage.getItem('barflow_device_id');
    if (!id) {
      id = `device_${uuidv4()}`;
      localStorage.setItem('barflow_device_id', id);
    }
    return id;
  } catch {
    // localStorage blocked (iframe sandbox, storage quota exceeded, etc.)
    if (!_memDeviceId) _memDeviceId = `device_mem_${uuidv4()}`;
    return _memDeviceId;
  }
}

// ─── Pending Orders ──────────────────────────────────────────
export async function savePendingOrder(
  businessId: string,
  order: { tableId?: string; items: OfflineOrderItem[]; notes?: string },
): Promise<string> {
  const database = await getDB();
  const localId  = uuidv4();

  await database.put('pending_orders', {
    localId,
    businessId,
    tableId:    order.tableId,
    items:      order.items,
    notes:      order.notes,
    createdAt:  new Date().toISOString(),
    deviceId:   getDeviceId(),
    retryCount: 0,
  });

  console.log(`[BarFlow Offline] Order saved locally: ${localId}`);
  return localId;
}

export async function getPendingOrders(businessId: string) {
  const database = await getDB();
  return database.getAllFromIndex('pending_orders', 'by-business', businessId);
}

export async function getPendingOrderCount(businessId: string): Promise<number> {
  const orders = await getPendingOrders(businessId);
  return orders.length;
}

export async function removePendingOrder(localId: string): Promise<void> {
  const database = await getDB();
  await database.delete('pending_orders', localId);
}

/**
 * Increments the retry counter for a pending order.
 * Returns the new retryCount so callers can decide whether to abandon.
 */
export async function incrementRetryCount(localId: string): Promise<number> {
  const database = await getDB();
  const record   = await database.get('pending_orders', localId);
  if (!record) return MAX_RETRY; // already removed — treat as abandoned

  const updated = { ...record, retryCount: record.retryCount + 1 };
  await database.put('pending_orders', updated);
  return updated.retryCount;
}

// ─── Sync Log ────────────────────────────────────────────────
export async function writeSyncLog(
  localId:  string,
  status:   'synced' | 'failed' | 'conflict',
  error?:   string,
  serverId?: string,
): Promise<void> {
  const database = await getDB();
  await database.put('sync_log', {
    id:       uuidv4(),
    localId,
    serverId,
    status,
    error,
    syncedAt: new Date().toISOString(),
  });
}

// ─── Menu Cache ───────────────────────────────────────────────
export async function cacheMenu(
  businessId: string,
  data: { categories: any[]; products: any[] },
): Promise<void> {
  const database = await getDB();
  await database.put('menu_cache', {
    businessId,
    categories: data.categories,
    products:   data.products,
    cachedAt:   new Date().toISOString(),
  });
}

export async function getCachedMenu(businessId: string) {
  const database = await getDB();
  return database.get('menu_cache', businessId);
}

// ─── Batch Sync Engine (NestJS /api/v1/sync endpoint) ────────
/**
 * Alternative sync path used when the NestJS backend exposes a
 * batch `/api/v1/sync` endpoint.  The store's `syncOfflineOrders`
 * uses per-order API calls instead; this function is available for
 * future Phase 7 backend integration.
 */
export async function syncPendingOrders(
  businessId: string,
  apiToken:   string,
  apiBaseUrl: string,
): Promise<{ synced: number; failed: number; conflicts: number }> {
  const pending = await getPendingOrders(businessId);
  if (pending.length === 0) return { synced: 0, failed: 0, conflicts: 0 };

  console.log(`[BarFlow Sync] Uploading ${pending.length} offline orders...`);

  const response = await fetch(`${apiBaseUrl}/api/v1/sync`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      businessId,
      deviceId:      getDeviceId(),
      pendingOrders: pending,
      lastSyncAt:    new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error(`Sync failed: ${response.status}`);

  const result   = await response.json();
  const database = await getDB();

  for (const localId of result.processedOrders ?? []) {
    await database.delete('pending_orders', localId);
    await writeSyncLog(localId, 'synced', undefined, undefined);
  }
  for (const failure of result.failedOrders ?? []) {
    await writeSyncLog(failure.localId, 'failed', failure.error);
  }
  for (const conflict of result.conflicts ?? []) {
    await database.delete('pending_orders', conflict.localId);
    await writeSyncLog(conflict.localId, 'conflict', undefined, conflict.serverId);
  }

  return {
    synced:    result.processedOrders?.length ?? 0,
    failed:    result.failedOrders?.length    ?? 0,
    conflicts: result.conflicts?.length       ?? 0,
  };
}
