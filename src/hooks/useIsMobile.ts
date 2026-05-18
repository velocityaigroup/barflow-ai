'use client';
import { useEffect, useState } from 'react';

/**
 * Returns true when the viewport is narrower than the given breakpoint.
 * Defaults to 640px (sm breakpoint) — below this the 3-column POS layout breaks.
 *
 * Uses matchMedia for zero re-render overhead (no resize event polling).
 * SSR-safe: returns false on the server.
 */
export function useIsMobile(breakpoint = 640): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql     = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches); // sync on mount
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}
