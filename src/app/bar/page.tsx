'use client';
import { useMemo } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { OrderCard } from '@/components/bar/OrderCard';
import { Coffee, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@/data/tables';

const COLUMNS: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: 'new',         label: 'New Orders', emoji: '🔔' },
  { status: 'in_progress', label: 'Making',     emoji: '🍹' },
  { status: 'ready',       label: 'Ready',      emoji: '✅' },
];

export default function BarPage() {
  const { orders } = useDemoStore();

  const barOrders = useMemo(
    () => orders.filter((o) => o.destination === 'bar' && o.status !== 'delivered'),
    [orders],
  );

  const byStatus = (status: OrderStatus) =>
    barOrders.filter((o) => o.status === status).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const newCount = byStatus('new').length;

  return (
    <div className="screen">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Coffee size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="heading-md leading-none">Bar Dashboard</h1>
            <p className="text-tertiary text-xs mt-0.5">
              {barOrders.length} active order{barOrders.length !== 1 ? 's' : ''}
              {newCount > 0 && (
                <span className="text-accent font-bold ml-2">· {newCount} new</span>
              )}
            </p>
          </div>
        </div>
        <StatusBar />
      </header>

      {/* Kanban board */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-3 h-full px-4 py-4 overflow-x-auto no-scrollbar">
          {COLUMNS.map(({ status, label, emoji }) => {
            const colOrders = byStatus(status);
            return (
              <div key={status} className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
                {/* Column header */}
                <div className={`flex items-center gap-2 mb-3 px-3.5 py-2.5 rounded-xl border
                  ${status === 'new'
                      ? 'bg-accent/8   border-accent/30   text-accent'
                      : status === 'in_progress'
                      ? 'bg-warning/8  border-warning/30  text-warning'
                      : 'bg-success/8  border-success/30  text-success'
                  }`}>
                  <span className="text-lg">{emoji}</span>
                  <span className="font-bold text-sm">{label}</span>
                  <div className={`ml-auto flex items-center justify-center w-5 h-5 rounded-full text-xs font-black
                    ${status === 'new'
                        ? 'bg-accent   text-bg'
                        : status === 'in_progress'
                        ? 'bg-warning  text-bg'
                        : 'bg-success  text-bg'
                    }`}>
                    {colOrders.length}
                  </div>
                </div>

                {/* Orders */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 no-scrollbar">
                  {colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-tertiary gap-2">
                      <span className="text-2xl opacity-40">
                        {status === 'ready' ? '✓' : status === 'new' ? '🔔' : '⏳'}
                      </span>
                      <p className="text-xs opacity-60">
                        {status === 'new' ? 'Waiting for orders' : status === 'in_progress' ? 'Nothing in progress' : 'All clear'}
                      </p>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
