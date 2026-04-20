'use client';
import { OrderData, OrderStatus } from '@/store/useDemoStore';
import { useDemoStore } from '@/store/useDemoStore';
import { Clock, ChevronRight } from 'lucide-react';

const CARD_CLASS: Record<OrderStatus, string> = {
  new:       'order-card-new',
  in_progress: 'order-card-progress',
  ready:     'order-card-ready',
  delivered: 'order-card',
};

const BADGE_CLASS: Record<OrderStatus, string> = {
  new:       'badge-new',
  in_progress: 'badge-progress',
  ready:     'badge-ready',
  delivered: 'badge-delivered',
};

const BADGE_LABEL: Record<OrderStatus, string> = {
  new:         'NEW',
  in_progress: 'COOKING',
  ready:       'READY',
  delivered:   'DONE',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new:       'in_progress',
  in_progress: 'ready',
  ready:     'delivered',
};

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  new:       '▶ Start',
  in_progress: '✓ Ready',
  ready:     '🚀 Served',
};

const ACTION_CLASS: Partial<Record<OrderStatus, string>> = {
  new:         'btn-primary',
  in_progress: 'btn w-full bg-warning/20 border border-warning/40 text-warning font-bold hover:bg-warning/30',
  ready:       'btn-success w-full',
};

export function OrderCard({ order }: { order: OrderData }) {
  const { updateOrderStatus } = useDemoStore();

  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = elapsed >= 15 && order.status !== 'ready' && order.status !== 'delivered';

  const handleAction = () => {
    const next = NEXT_STATUS[order.status];
    if (next) updateOrderStatus(order.id, next);
  };

  return (
    <div className={`${CARD_CLASS[order.status]} animate-scale-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center font-black text-lg text-primary">
            {order.tableNumber}
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Table {order.tableNumber}</p>
            {order.staffName && (
              <p className="text-xs text-tertiary">{order.staffName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`badge ${BADGE_CLASS[order.status]}`}>
            {BADGE_LABEL[order.status]}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className={`flex items-center gap-1.5 mb-3 text-xs font-mono ${
        isUrgent ? 'text-danger font-bold' : 'text-tertiary'
      }`}>
        <Clock size={11} />
        <span>{elapsed === 0 ? 'Just now' : `${elapsed}m ago`}</span>
        {isUrgent && <span className="text-danger font-bold">⚠️ Overdue</span>}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4 min-h-[40px]">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xl font-black text-accent leading-tight w-6 text-center shrink-0">
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

      {/* Total */}
      <div className="flex items-center justify-between mb-3 pt-2 border-t border-border">
        <span className="text-tertiary text-xs">Total</span>
        <span className="text-primary font-bold text-sm tabular-nums">
          €{order.total.toFixed(2)}
        </span>
      </div>

      {/* Action button */}
      {NEXT_STATUS[order.status] && (
        <button onClick={handleAction} className={`${ACTION_CLASS[order.status]} w-full`}>
          {ACTION_LABEL[order.status]}
        </button>
      )}
    </div>
  );
}
