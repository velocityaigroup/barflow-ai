'use client';
/**
 * useOfflineSync
 *
 * Listens for three connectivity signals and triggers a sync on each:
 *   1. browser `online`   — device regained network access
 *   2. browser `offline`  — device lost network access (updates store flag)
 *   3. `visibilitychange` — tab came back to foreground while online
 *      (catches cases where the device reconnected while the tab was hidden)
 */
import { useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';

const RECONNECT_DELAY_MS = 1_500; // let the connection stabilise before syncing

export function useOfflineSync() {
  const { setOnline, syncOfflineOrders } = useDemoStore();

  useEffect(() => {
    // Sync initial state immediately.
    setOnline(navigator.onLine);

    const trySync = async () => {
      try {
        await syncOfflineOrders();
      } catch (err) {
        console.error('[OfflineSync] Auto-sync failed:', err);
      }
    };

    const handleOnline = async () => {
      setOnline(true);
      // Brief pause to let the connection stabilise before hitting the API.
      await new Promise<void>((r) => setTimeout(r, RECONNECT_DELAY_MS));
      await trySync();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        // Tab came back into focus while online — sync any orders that
        // were queued while the device was in another tab or backgrounded.
        await trySync();
      }
    };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
