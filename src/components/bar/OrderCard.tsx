'use client';
import { OrderData, OrderStatus, useDemoStore } from '@/store/useDemoStore';
import { Clock, AlertTriangle } from 'lucide-react';

// ── Status → design-system class maps ────────────────────────
const CARD_CLASS: Record<OrderStatus, string> = {
  new:         'order-card-new',
  in_progress: 'order-card-progress',
  ready:       'order-card-ready',
  delivered:   'order-card',
};

const BADGE_CLASS: Record<OrderStatus, string> = {
  new:         'badge-new',
  in_progress: 'badge-progress',
  ready:       'badge-ready',
  delivered:   'badge-delivered',
};

const BADGE_LABEL: Record<OrderStatus, string> = {
  new:         'NEW',
  in_progress: 'MAKING',
  ready:       'READY',
  delivered:   'DONE',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new:         'in_progress',
  in_progress: 'ready',
  ready:       'delivered',
};

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  new:         '▶  Start Making',
  in_progress: '✓  Mark Ready',
  ready:       '🚀  Served',
};

// Action button styling per status
const ACTION_CLASS: Partial<Record<OrderStatus, string>> = {
  new:
    'btn-primary w-full font-black',
  in_progress:
    'btn w-full bg-warning/15 border border-warning/40 text-warning font-black hover:bg-warning/25',
  ready:
    'btn-success w-full font-black',
};

export function OrderCard({ order }: { order: OrderData }) {
  const { updateOrderStatus } = useDemoStore();

  const elapsed  = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = elapsed >= 15 && order.status !== 'ready' && order.status !== 'delivered';

  const handleAction = () => {
    const next = NEXT_STATUS[order.status];
    if (next) updateOrderStatus(order.id, next);
  };

  return (
    <div className={`${CARD_CLASS[order.status]} animate-scale-in flex flex-col gap-3`}>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">

        {/* Table badge + staff */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl bg-bg border border-border
                       flex items-center justify-center font-black text-lg text-primary
                       shrink-0 tabular-nums"
          >
            {order.tableNumber}
          </div>
          <div className="min-w-0">
            <p className="text-primary font-bold text-sm leading-none">
              Table {order.tableNumber}
            </p>
            {order.staffName && (
              <p className="text-tertiary text-xs mt-0.5 leading-none">{order.staffName}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className={`badge ${BADGE_CLASS[order.status]} shrink-0`}>
          {BADGE_LABEL[order.status]}
        </div>
      </div>

      {/* ── Timer ────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-1.5 text-xs font-mono
          ${isUrgent ? 'text-danger font-bold' : 'text-tertiary'}`}
      >
        {isUrgent
          ? <AlertTriangle size={11} className="text-danger shrink-0" />
          : <Clock size={11} className="shrink-0" />
        }
        <span>{elapsed === 0 ? 'Just now' : `${elapsed}m`}</span>
        {isUrgent && (
          <span className="text-danger font-bold ml-1 uppercase tracking-wide"
                style={{ fontSize: '10px' }}>
            Overdue
          </span>
        )}
        {/* Offline indicator */}
        {order.isOffline && (
          <span className="ml-auto text-warning font-bold"
                style={{ fontSize: '10px' }}>
            📡 offline
          </span>
        )}
      </div>

      {/* ── Items ────────────────────────────────────────── */}
      <div className="divider" />
      <div className="space-y-2 flex-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              className="text-accent font-black leading-tight shrink-0 tabular-nums
                         w-6 text-center"
              style={{ fontSize: '18px' }}
            >
              {item.qty}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-primary font-semibold text-sm leading-tight">{item.name}</p>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="text-tertiary text-xs mt-0.5">
                  {item.modifiers.join(' · ')}
                </p>
              )}
              {item.note && (
                <p className="text-warning/80 text-xs mt-0.5 italic">📝 {item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Total + action ────────────────────────────────── */}
      <div className="divider" />
      <div className="flex items-center justify-between">
        <span className="text-tertiary text-xs">Total</span>
        <span className="text-primary font-bold tabular-nums">€{order.total.toFixed(2)}</span>
      </div>

      {NEXT_STATUS[order.status] && (
        <button
          onClick={handleAction}
          className={`${ACTION_CLASS[order.status]} min-h-[44px]`}
        >
          {ACTION_LABEL[order.status]}
        </button>
      )}
    </div>
  );
}
