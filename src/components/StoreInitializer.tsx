'use client';
import { useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';

// Mounts once in the root layout and loads all live data from Supabase
export function StoreInitializer() {
  const { initStore, initialized } = useDemoStore();
  useEffect(() => {
    if (!initialized) initStore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
