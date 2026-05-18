'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { useVenueConfig } from '@/hooks/useVenueConfig';
import { ChefHat, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { OrderStatus } from '@/store/useDemoStore';

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useDemoStore();
  const { venueName } = useVenueConfig();

  // ── Display / Kiosk mode ─────────────────────────────────────
  const [displayMode, setDisplayMode] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const enterDisplayMode = async () => {
    setDisplayMode(true);
    // Prevent the screen from sleeping (supported on Chrome / Edge)
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch {
        // Wake lock can be denied (e.g., low battery mode) — not fatal
      }
    }
    // Request fullscreen if available
    try {
      await document.documentElement.requestFullscreen?.();
    } catch { /* not available or denied */ }
  };

  const exitDisplayMode = async () => {
    setDisplayMode(false);
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch { /* ignore */ }
  };

  // Re-acquire wake lock when the tab becomes visible again (browser releases
  // wake locks automatically when the tab loses focus).
  useEffect(() => {
    if (!displayMode) return;
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch { /* low battery / denied */ }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [displayMode]);

  // Keyboard: Escape exits display mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && displayMode) exitDisplayMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [displayMode]);

  // Cleanup wake lock on unmount
  useEffect(() => {
    return () => {
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);

  // ── Orders ───────────────────────────────────────────────────
  const kitchenOrders = useMemo(
    () =>
      orders
        .filter((o) => o.destination === 'kitchen' && o.status !== 'delivered')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders],
  );

  const elapsed = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
    return mins === 0 ? 'Just now' : `${mins}m`;
  };

  const isUrgent = (dateStr: string, status: OrderStatus) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
    return mins >= 15 && status !== 'ready';
  };

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    new:         'in_progress',
    in_progress: 'ready',
    ready:       'delivered',
  };

  const actionLabel: Partial<Record<OrderStatus, string>> = {
    new:         '▶ Start Cooking',
    in_progress: '✓ Mark Ready',
    ready:       '🚀 Served',
  };

  const actionStyle: Partial<Record<OrderStatus, string>> = {
    new:         'btn-primary w-full text-base py-3',
    in_progress: 'btn w-full bg-warning text-bg font-black py-3 text-base hover:brightness-110',
    ready:       'btn-success w-full text-base py-3',
  };

  // ────────────────────────────────────────────────────────────
  return (
    <div className="screen" style={displayMode ? { fontSize: '115%' } : undefined}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <ChefHat size={18} className="text-warning" />
          </div>
          <div>
            <h1 className="heading-md leading-none">Kitchen Display</h1>
            <p className="text-tertiary text-xs mt-0.5">
              {venueName}
              {kitchenOrders.length > 0 && (
                <>
                  <span className="mx-1 opacity-40">·</span>
                  <span>{kitchenOrders.length} ticket{kitchenOrders.length !== 1 ? 's' : ''}</span>
                </>
              )}
              {kitchenOrders.filter((o) => o.status === 'new').length > 0 && (
                <span className="text-warning font-bold ml-2">
                  · {kitchenOrders.filter((o) => o.status === 'new').length} waiting
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Display mode toggle */}
          <button
            onClick={displayMode ? exitDisplayMode : enterDisplayMode}
            title={displayMode ? 'Exit display mode (Esc)' : 'Enter display mode — fullscreen + wake lock'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        border transition-all duration-150
                        ${displayMode
                          ? 'bg-warning/15 border-warning/40 text-warning'
                          : 'bg-hover border-border text-tertiary hover:text-secondary'
                        }`}
          >
            {displayMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{displayMode ? 'Exit Display' : 'Display Mode'}</span>
          </button>
          <StatusBar />
        </div>
      </header>

      {/* ── Display mode hint ────────────────────────────────── */}
      {displayMode && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 shrink-0"
          style={{ backgroundColor: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.15)' }}
        >
          <span className="text-warning/60 text-xs">📺 Display Mode active</span>
          <span className="text-tertiary text-xs opacity-50">— Press Esc to exit</span>
        </div>
      )}

      {/* ── Ticket grid ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {kitchenOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-tertiary">
            <span className={displayMode ? 'text-8xl' : 'text-6xl'}>✅</span>
            <p className={`heading-sm text-secondary ${displayMode ? 'text-2xl' : ''}`}>All caught up!</p>
            <p className="body-sm text-center">No pending kitchen tickets</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${displayMode
            ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {kitchenOrders.map((order) => {
              const urgent = isUrgent(order.createdAt, order.status);
              return (
                <div
                  key={order.id}
                  className={`card p-5 flex flex-col gap-4 animate-scale-in ${
                    order.status === 'new'
                      ? urgent ? 'border-danger/60' : 'border-accent/50'
                      : order.status === 'in_progress'
                      ? 'border-warning/60'
                      : 'border-success/60'
                  }`}
                >
                  {/* Ticket header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl bg-bg flex items-center justify-center font-black text-primary border border-border
                        ${displayMode ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl'}`}>
                        {order.tableNumber}
                      </div>
                      <div>
                        <p className={`font-bold text-primary ${displayMode ? 'text-xl' : ''}`}>
                          Table {order.tableNumber}
                        </p>
                        <div className={`flex items-center gap-1.5 font-mono mt-0.5 ${
                          urgent ? 'text-danger font-bold' : 'text-tertiary'
                        } ${displayMode ? 'text-sm' : 'text-xs'}`}>
                          <Clock size={displayMode ? 14 : 11} />
                          <span>{elapsed(order.createdAt)}</span>
                          {urgent && <span>⚠️</span>}
                        </div>
                      </div>
                    </div>
                    <div className={`badge ${
                      order.status === 'new'
                        ? urgent ? 'badge-occupied' : 'badge-new'
                        : order.status === 'in_progress'
                        ? 'badge-progress'
                        : 'badge-ready'
                    }`}>
                      {order.status === 'new'
                        ? urgent ? 'URGENT' : 'NEW'
                        : order.status === 'in_progress'
                        ? 'COOKING'
                        : 'READY'}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Items — intentionally large for readability at distance */}
                  <div className="space-y-3 flex-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`font-black text-accent leading-none w-10 text-center shrink-0 tabular-nums
                          ${displayMode ? 'text-5xl' : 'text-3xl'}`}>
                          {item.qty}
                        </span>
                        <div>
                          <p className={`text-primary font-bold leading-tight ${displayMode ? 'text-2xl' : 'text-lg'}`}>
                            {item.name}
                          </p>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className={`text-secondary mt-0.5 ${displayMode ? 'text-base' : 'text-sm'}`}>
                              {item.modifiers.join(' · ')}
                            </p>
                          )}
                          {item.note && (
                            <p className={`text-warning font-medium mt-1 ${displayMode ? 'text-base' : 'text-sm'}`}>
                              📝 {item.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  {nextStatus[order.status] && (
                    <button
                      onClick={() => updateOrderStatus(order.id, nextStatus[order.status]!)}
                      className={`${actionStyle[order.status]} ${displayMode ? 'py-5 text-xl' : ''}`}
                    >
                      {actionLabel[order.status]}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hide nav in display mode — staff locked to this screen */}
      {!displayMode && <BottomNav />}
    </div>
  );
}
