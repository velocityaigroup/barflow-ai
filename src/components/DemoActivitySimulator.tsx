'use client';
import { useEffect, useRef } from 'react';
import { useDemoStore } from '@/store/useDemoStore';

/**
 * DemoActivitySimulator
 *
 * Injects realistic order progression during demo / pitch sessions.
 * Only active when no real backend is configured (demo mode).
 * Ticks on a staggered schedule to keep the UI feeling "live" without
 * overwhelming the screen during a presentation.
 *
 * Timeline (repeating loop):
 *   0 s  — advance one NEW order → IN_PROGRESS
 *   25 s — advance one IN_PROGRESS order → READY
 *   50 s — mark one READY order delivered + seed a fresh NEW order
 *   75 s — repeat
 */

const DEMO_ORDER_SEEDS = [
  {
    id: () => `sim-${Date.now()}-a`,
    tableId: 't3', tableNumber: 3, destination: 'bar' as const,
    items: [{ name: 'Mojito', qty: 2, price: 12 }, { name: 'Aperol Spritz', qty: 1, price: 10 }],
    total: 34, staffName: 'Alex',
  },
  {
    id: () => `sim-${Date.now()}-b`,
    tableId: 't7', tableNumber: 7, destination: 'bar' as const,
    items: [{ name: 'Espresso Martini', qty: 1, price: 13 }, { name: 'Margarita', qty: 1, price: 12 }],
    total: 25, staffName: 'Maria',
  },
  {
    id: () => `sim-${Date.now()}-c`,
    tableId: 't12', tableNumber: 12, destination: 'kitchen' as const,
    items: [{ name: 'Beach Burger', qty: 2, price: 14 }, { name: 'Greek Salad', qty: 1, price: 9 }],
    total: 37, staffName: 'Alex',
  },
  {
    id: () => `sim-${Date.now()}-d`,
    tableId: 't10', tableNumber: 10, destination: 'bar' as const,
    items: [{ name: 'Tequila Shot', qty: 4, price: 5 }, { name: 'Heineken 0.5L', qty: 2, price: 5 }],
    total: 30, staffName: 'Maria',
  },
  {
    id: () => `sim-${Date.now()}-e`,
    tableId: 't4', tableNumber: 4, destination: 'kitchen' as const,
    items: [{ name: 'Nachos', qty: 2, price: 10 }, { name: 'Bruschetta', qty: 1, price: 7 }],
    total: 27, staffName: 'Alex',
  },
];

let _seedIndex = 0;

function nextSeed() {
  const seed = DEMO_ORDER_SEEDS[_seedIndex % DEMO_ORDER_SEEDS.length];
  _seedIndex++;
  return {
    ...seed,
    id: seed.id(),
    status: 'new' as const,
    createdAt: new Date().toISOString(),
    isOffline: false,
  };
}

export function DemoActivitySimulator() {
  const hasBackend = Boolean(process.env.NEXT_PUBLIC_API_URL);
  const store      = useDemoStore();
  const tickRef    = useRef(0);

  useEffect(() => {
    // Only run in demo mode
    if (hasBackend) return;

    const tick = () => {
      const phase = tickRef.current % 3;
      tickRef.current++;

      const { orders } = useDemoStore.getState();

      if (phase === 0) {
        // NEW → IN_PROGRESS
        const target = orders.find((o) => o.status === 'new' && !o.isOffline);
        if (target) {
          useDemoStore.getState().updateOrderStatus(target.id, 'in_progress');
        }
      } else if (phase === 1) {
        // IN_PROGRESS → READY
        const target = orders.find((o) => o.status === 'in_progress');
        if (target) {
          useDemoStore.getState().updateOrderStatus(target.id, 'ready');
        }
      } else {
        // Deliver one READY order, seed a new one
        const readyOrder = orders.find((o) => o.status === 'ready');
        if (readyOrder) {
          useDemoStore.getState().updateOrderStatus(readyOrder.id, 'delivered');
        }
        // Inject a fresh order after a short delay so both state changes are visible
        setTimeout(() => {
          const { orders: current } = useDemoStore.getState();
          // Cap at 8 active orders to avoid UI overflow during long demos
          const active = current.filter((o) => o.status !== 'delivered').length;
          if (active < 8) {
            useDemoStore.setState((s) => ({
              orders: [nextSeed(), ...s.orders.filter((o) => o.status !== 'delivered').slice(0, 9)],
            }));
          }
        }, 1500);
      }
    };

    // First tick after 20 s so demo has time to be introduced
    const first = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 25_000);
      return () => clearInterval(interval);
    }, 20_000);

    return () => clearTimeout(first);
  }, [hasBackend]); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // renders nothing — purely side-effect
}
