'use client';
import { useDemoStore } from '@/store/useDemoStore';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * StatusBar — top-right status cluster shown on every page.
 *
 * Displays: online state · pending sync · live new-order count · clock.
 * Venue name is pulled from env (falls back to "BarFlow").
 */
export function StatusBar() {
  const { orders, isOnline, pendingSyncCount } = useDemoStore();
  const [time, setTime] = useState('');

  const VENUE = process.env.NEXT_PUBLIC_VENUE_NAME || 'BarFlow';

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 10_000);
    return () => clearInterval(t);
  }, []);

  const newOrders = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="flex items-center gap-2">

      {/* New orders alert — most important, shown first */}
      {newOrders > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                        bg-accent/12 border border-accent/25 animate-pulse-slow">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs text-accent font-bold tabular-nums">{newOrders} new</span>
        </div>
      )}

      {/* Pending sync */}
      {pendingSyncCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full
                        bg-warning/12 border border-warning/25">
          <span className="text-[10px]">📡</span>
          <span className="text-xs text-warning font-bold tabular-nums">{pendingSyncCount}</span>
        </div>
      )}

      {/* Online dot */}
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <div className="online-dot" />
        ) : (
          <div className="offline-dot animate-pulse" />
        )}
        <span className={`text-xs font-medium hidden sm:block
          ${isOnline ? 'text-secondary' : 'text-danger font-bold'}`}>
          {isOnline ? VENUE : 'Offline'}
        </span>
      </div>

      {/* Clock */}
      <div className="flex items-center gap-1 text-tertiary">
        <Clock size={12} />
        <span className="text-xs font-mono tabular-nums">{time}</span>
      </div>
    </div>
  );
}
