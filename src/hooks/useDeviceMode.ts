'use client';
import { useState, useCallback } from 'react';

export type DeviceMode = 'auto' | 'pos' | 'bar' | 'kitchen' | 'manager';

const STORAGE_KEY = 'barflow_device_mode';

function readStored(): DeviceMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as DeviceMode | null;
    const valid: DeviceMode[] = ['auto', 'pos', 'bar', 'kitchen', 'manager'];
    return stored && valid.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

/**
 * useDeviceMode
 *
 * Allows any device to be "pinned" to a specific operational role that
 * persists across page reloads and browser restarts (stored in localStorage).
 *
 * Modes
 * ─────
 * 'auto'    Follow the logged-in staff member's role (default).
 * 'pos'     Dedicated order-entry tablet — stays on the POS screen.
 * 'bar'     Dedicated bar station display — shows bar order queue.
 * 'kitchen' Dedicated kitchen display — shows kitchen tickets, hides nav.
 * 'manager' Dedicated manager dashboard device.
 *
 * In any pinned mode (`isPinned === true`) the BottomNav is hidden so staff
 * can't accidentally navigate away, and the app offers a wake-lock request to
 * prevent the screen from sleeping mid-service.
 *
 * Usage:
 *   const { deviceMode, setDeviceMode, isPinned } = useDeviceMode();
 */
export function useDeviceMode() {
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>(readStored);

  const setDeviceMode = useCallback((mode: DeviceMode) => {
    setDeviceModeState(mode);
    try {
      if (mode === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // localStorage unavailable — state still updates in memory
    }
  }, []);

  /** True when the device is locked to a specific screen. */
  const isPinned = deviceMode !== 'auto';

  return { deviceMode, setDeviceMode, isPinned };
}
