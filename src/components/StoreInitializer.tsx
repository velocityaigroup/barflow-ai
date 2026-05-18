'use client';
import { useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { useOfflineSync } from '@/hooks/useOfflineSync';

/**
 * Mounts once in the root layout.
 * Loads all live data and activates offline sync.
 */
export function StoreInitializer() {
  const { initStore, initialized } = useDemoStore();

  // Online/offline detection + auto-sync
  useOfflineSync();

  useEffect(() => {
    if (!initialized) initStore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
