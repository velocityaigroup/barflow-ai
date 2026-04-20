'use client';
import { useMemo } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { ChefHat, Clock } from 'lucide-react';
import { OrderStatus } from '@/data/tables';

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useDemoStore();

  const kitchenOrders = useMemo(
    () =>
      orders
        .filter((o) => o.destination === 'kitchen' && o.status !== 'delivered')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [orders],
  );

  const elapsed = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return mins === 0 ? 'Just now' : `${mins}m`;
  };

  const isUrgent = (dateStr: string, status: OrderStatus) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return mins >= 15 && status !== 'ready';
  };

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    new: 'in_progress',
    in_progress: 'ready',
    ready: 'delivered',
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

  return (
    <div className="screen">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            <ChefHat size={18} className="text-warning" />
          </div>
          <div>
            <h1 className="heading-md leading-none">Kitchen Display</h1>
            <p className="text-tertiary text-xs mt-0.5">
              {kitchenOrders.length} ticket{kitchenOrders.length !== 1 ? 's' : ''}
              {kitchenOrders.filter((o) => o.status === 'new').length > 0 && (
                <span className="text-warning font-bold ml-2">
                  · {kitchenOrders.filter((o) => o.status === 'new').length} waiting
                </span>
              )}
            </p>
          </div>
        </div>
        <StatusBar />
      </header>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {kitchenOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-tertiary">
            <span className="text-6xl">✅</span>
            <p className="heading-sm text-secondary">All caught up!</p>
            <p className="body-sm text-center">No pending kitchen tickets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center font-black text-2xl text-primary border border-border">
                        {order.tableNumber}
                      </div>
                      <div>
                        <p className="font-bold text-primary">Table {order.tableNumber}</p>
                        <div className={`flex items-center gap-1.5 text-xs font-mono mt-0.5 ${urgent ? 'text-danger font-bold' : 'text-tertiary'}`}>
                          <Clock size={11} />
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

                  {/* Items — BIG and readable from distance */}
                  <div className="space-y-3 flex-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-3xl font-black text-accent leading-none w-8 text-center shrink-0 tabular-nums">
                          {item.qty}
                        </span>
                        <div>
                          <p className="text-primary font-bold text-lg leading-tight">{item.name}</p>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className="text-secondary text-sm mt-0.5">
                              {item.modifiers.join(' · ')}
                            </p>
                          )}
                          {item.note && (
                            <p className="text-warning text-sm mt-1 font-medium">
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
                      className={actionStyle[order.status]}
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

      <BottomNav />
    </div>
  );
}
