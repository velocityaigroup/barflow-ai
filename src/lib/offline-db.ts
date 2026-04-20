/**
 * BarFlow Offline-First Engine
 * Uses IndexedDB (via idb) to store orders locally when offline.
 * Syncs automatically when connection is restored.
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

// ─── Schema ──────────────────────────────────────────────────
interface BarFlowDB extends DBSchema {
  pending_orders: {
    key: string;
    value: {
      localId: string;
      businessId: string;
      tableId?: string;
      items: OfflineOrderItem[];
      notes?: string;
      createdAt: string;
      deviceId: string;
      retryCount: number;
    };
    indexes: { 'by-business': string; 'by-date': string };
  };
  sync_log: {
    key: string;
    value: {
      id: string;
      localId: string;
      serverId?: string;
      status: 'synced' | 'failed' | 'conflict';
      error?: string;
      syncedAt: string;
    };
  };
  menu_cache: {
    key: string;
    value: {
      businessId: string;
      categories: any[];
      products: any[];
      cachedAt: string;
    };
  };
}

export interface OfflineOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  selectedModifiers: any[];
  customNote?: string;
  unitPrice: number;
  totalPrice: number;
}

// ─── DB Instance ─────────────────────────────────────────────
let db: IDBPDatabase<BarFlowDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BarFlowDB>> {
  if (db) return db;

  db = await openDB<BarFlowDB>('barflow-offline', 2, {
    upgrade(database, oldVersion) {
      // Pending orders store
      if (!database.objectStoreNames.contains('pending_orders')) {
        const store = database.createObjectStore('pending_orders', { keyPath: 'localId' });
        store.createIndex('by-business', 'businessId');
        store.createIndex('by-date', 'createdAt');
      }

      // Sync log
      if (!database.objectStoreNames.contains('sync_log')) {
        database.createObjectStore('sync_log', { keyPath: 'id' });
      }

      // Menu cache
      if (!database.objectStoreNames.contains('menu_cache')) {
        database.createObjectStore('menu_cache', { keyPath: 'businessId' });
      }
    },
  });

  return db;
}

// ─── Device ID ────────────────────────────────────────────────
export function getDeviceId(): string {
  let id = localStorage.getItem('barflow_device_id');
  if (!id) {
    id = `device_${uuidv4()}`;
    localStorage.setItem('barflow_device_id', id);
  }
  return id;
}

// ─── Pending Orders ──────────────────────────────────────────
export async function savePendingOrder(
  businessId: string,
  order: { tableId?: string; items: OfflineOrderItem[]; notes?: string },
): Promise<string> {
  const database = await getDB();
  const localId = uuidv4();

  await database.put('pending_orders', {
    localId,
    businessId,
    tableId: order.tableId,
    items: order.items,
    notes: order.notes,
    createdAt: new Date().toISOString(),
    deviceId: getDeviceId(),
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

// ─── Menu Cache ───────────────────────────────────────────────
export async function cacheMenu(businessId: string, data: { categories: any[]; products: any[] }): Promise<void> {
  const database = await getDB();
  await database.put('menu_cache', {
    businessId,
    categories: data.categories,
    products: data.products,
    cachedAt: new Date().toISOString(),
  });
}

export async function getCachedMenu(businessId: string) {
  const database = await getDB();
  return database.get('menu_cache', businessId);
}

// ─── Sync Engine ─────────────────────────────────────────────
export async function syncPendingOrders(
  businessId: string,
  apiToken: string,
  apiBaseUrl: string,
): Promise<{ synced: number; failed: number; conflicts: number }> {
  const pending = await getPendingOrders(businessId);
  if (pending.length === 0) return { synced: 0, failed: 0, conflicts: 0 };

  console.log(`[BarFlow Sync] Uploading ${pending.length} offline orders...`);

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        businessId,
        deviceId: getDeviceId(),
        pendingOrders: pending,
        lastSyncAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error(`Sync failed: ${response.status}`);

    const result = await response.json();
    const database = await getDB();

    // Remove successfully synced orders
    for (const localId of result.processedOrders) {
      await database.delete('pending_orders', localId);
      await database.put('sync_log', {
        id: uuidv4(),
        localId,
        status: 'synced',
        syncedAt: new Date().toISOString(),
      });
    }

    // Log failures
    for (const failure of result.failedOrders || []) {
      await database.put('sync_log', {
        id: uuidv4(),
        localId: failure.localId,
        status: 'failed',
        error: failure.error,
        syncedAt: new Date().toISOString(),
      });
    }

    // Log conflicts (already synced — remove locally)
    for (const conflict of result.conflicts || []) {
      await database.delete('pending_orders', conflict.localId);
      await database.put('sync_log', {
        id: uuidv4(),
        localId: conflict.localId,
        serverId: conflict.serverId,
        status: 'conflict',
        syncedAt: new Date().toISOString(),
      });
    }

    return {
      synced: result.processedOrders?.length || 0,
      failed: result.failedOrders?.length || 0,
      conflicts: result.conflicts?.length || 0,
    };
  } catch (error) {
    console.error('[BarFlow Sync] Sync failed:', error);
    throw error;
  }
}
