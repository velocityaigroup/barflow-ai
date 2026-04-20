'use client';
import { useMemo, useState } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { OrderCard } from '@/components/bar/OrderCard';
import { Coffee } from 'lucide-react';
import { OrderStatus } from '@/store/useDemoStore';

const TABS: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: 'new',         label: 'New',     emoji: '🔔' },
  { status: 'in_progress', label: 'Making',  emoji: '🍹' },
  { status: 'ready',       label: 'Ready',   emoji: '✅' },
];

export default function BarPage() {
  const { orders } = useDemoStore();
  const [activeTab, setActiveTab] = useState<OrderStatus>('new');

  const barOrders = useMemo(
    () => orders.filter((o) => o.destination === 'bar' && o.status !== 'delivered'),
    [orders],
  );

  const byStatus = (status: OrderStatus) =>
    barOrders
      .filter((o) => o.status === status)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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

      {/* ── MOBILE / TABLET: Tabbed layout (< lg) ─────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden lg:hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border shrink-0">
          {TABS.map(({ status, label, emoji }) => {
            const count = byStatus(status).length;
            const active = activeTab === status;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold
                            transition-all duration-150 border
                            ${active
                              ? status === 'new'
                                ? 'bg-accent/10 text-accent border-accent/30'
                                : status === 'in_progress'
                                ? 'bg-warning/10 text-warning border-warning/30'
                                : 'bg-success/10 text-success border-success/30'
                              : 'text-tertiary border-transparent hover:text-secondary hover:bg-hover'
                            }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
                {count > 0 && (
                  <span className={`ml-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-black
                                   flex items-center justify-center px-1
                    ${active
                      ? status === 'new' ? 'bg-accent text-bg'
                        : status === 'in_progress' ? 'bg-warning text-bg'
                        : 'bg-success text-bg'
                      : 'bg-hover text-secondary border border-border'
                    }`}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable list */}
        <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-3">
          {byStatus(activeTab).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-tertiary">
              <span className="text-5xl opacity-40">
                {activeTab === 'new' ? '🔔' : activeTab === 'in_progress' ? '⏳' : '✓'}
              </span>
              <p className="text-sm opacity-60">
                {activeTab === 'new' ? 'No new orders' : activeTab === 'in_progress' ? 'Nothing in progress' : 'All clear'}
              </p>
            </div>
          ) : (
            byStatus(activeTab).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>

      {/* ── DESKTOP: Kanban columns (lg+) ─────────────────────── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <div className="flex gap-3 h-full px-4 py-4 overflow-x-auto no-scrollbar w-full">
          {TABS.map(({ status, label, emoji }) => {
            const colOrders = byStatus(status);
            return (
              <div key={status} className="flex flex-col min-w-[260px] max-w-[320px] flex-1">
                <div className={`flex items-center gap-2 mb-3 px-3.5 py-2.5 rounded-xl border
                  ${status === 'new'
                    ? 'bg-accent/8 border-accent/30 text-accent'
                    : status === 'in_progress'
                    ? 'bg-warning/8 border-warning/30 text-warning'
                    : 'bg-success/8 border-success/30 text-success'
                  }`}>
                  <span className="text-lg">{emoji}</span>
                  <span className="font-bold text-sm">{label}</span>
                  <div className={`ml-auto w-5 h-5 rounded-full text-xs font-black flex items-center justify-center
                    ${status === 'new' ? 'bg-accent text-bg'
                    : status === 'in_progress' ? 'bg-warning text-bg'
                    : 'bg-success text-bg'}`}>
                    {colOrders.length}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                  {colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-tertiary gap-2">
                      <span className="text-2xl opacity-40">
                        {status === 'ready' ? '✓' : status === 'new' ? '🔔' : '⏳'}
                      </span>
                      <p className="text-xs opacity-60">
                        {status === 'new' ? 'Waiting for orders'
                        : status === 'in_progress' ? 'Nothing in progress'
                        : 'All clear'}
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
