'use client';
import { useEffect, useState } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { supabase } from '@/lib/supabase';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import {
  BarChart3, TrendingUp, Package, AlertTriangle,
  Coffee, ChefHat, Activity, Euro, RefreshCw
} from 'lucide-react';

interface TodayStats {
  revenue:       number;
  orderCount:    number;
  avgOrder:      number;
  topItems:      { name: string; count: number; revenue: number }[];
  hourlyRevenue: number[];
}

const LOW_STOCK = [
  { name: 'White Rum',  current: '2 bottles', minimum: '5 bottles', level: 0.4  },
  { name: 'Aperol',     current: '1 bottle',  minimum: '3 bottles', level: 0.33 },
  { name: 'Prosecco',   current: '3 bottles', minimum: '6 bottles', level: 0.5  },
];

export default function ManagerPage() {
  const { tables, orders } = useDemoStore();
  const [stats,    setStats]    = useState<TodayStats | null>(null);
  const [fetching, setFetching] = useState(true);

  const activeOrders  = orders.filter(o => o.status !== 'delivered').length;
  const occupancyRate = tables.length
    ? Math.round((tables.filter(t => t.status !== 'free').length / tables.length) * 100)
    : 0;

  const fetchStats = async () => {
    setFetching(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('orders')
      .select('total, items, created_at')
      .gte('created_at', todayStart.toISOString());

    if (!data || data.length === 0) {
      setStats({ revenue: 0, orderCount: 0, avgOrder: 0, topItems: [], hourlyRevenue: Array(9).fill(0) });
      setFetching(false);
      return;
    }

    const revenue    = data.reduce((s, o) => s + Number(o.total), 0);
    const orderCount = data.length;
    const avgOrder   = orderCount > 0 ? revenue / orderCount : 0;

    // Top sellers
    const itemMap: Record<string, { count: number; revenue: number }> = {};
    data.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item: any) => {
        if (!itemMap[item.name]) itemMap[item.name] = { count: 0, revenue: 0 };
        itemMap[item.name].count   += item.qty || 1;
        itemMap[item.name].revenue += (item.qty || 1) * (item.price || 0);
      });
    });
    const topItems = Object.entries(itemMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly revenue (last 9 hours)
    const nowHour = new Date().getHours();
    const hourlyRevenue = Array.from({ length: 9 }, (_, i) => {
      const h = (nowHour - 8 + i + 24) % 24;
      return data
        .filter(o => new Date(o.created_at).getHours() === h)
        .reduce((s, o) => s + Number(o.total), 0);
    });

    setStats({ revenue, orderCount, avgOrder, topItems, hourlyRevenue });
    setFetching(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const rev      = stats?.revenue       ?? 0;
  const ordCnt   = stats?.orderCount    ?? 0;
  const avg      = stats?.avgOrder      ?? 0;
  const topItems = stats?.topItems      ?? [];
  const hourly   = stats?.hourlyRevenue ?? Array(9).fill(0);

  return (
    <div className="screen">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BarChart3 size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="heading-md leading-none">Manager View</h1>
            <p className="text-tertiary text-xs mt-0.5">Real-time operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStats} className="btn-icon btn-ghost" disabled={fetching}>
            <RefreshCw size={16} className={fetching ? 'animate-spin text-accent' : 'text-tertiary'} />
          </button>
          <StatusBar />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

        {/* Revenue hero */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-accent/20"
             style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 100%)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/5 -translate-y-8 translate-x-8" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-accent" />
              <span className="label text-accent/80">Tonight's Revenue</span>
            </div>
            <div className="text-5xl font-black text-white mt-2 tabular-nums">
              €{rev.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Activity size={12} className="text-accent" />
                <span className="text-xs text-secondary">{ordCnt} orders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Euro size={12} className="text-accent" />
                <span className="text-xs text-secondary">€{avg.toFixed(2)} avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-success">{tables.filter(t => t.status !== 'free').length}</span>
            <span className="text-xs text-tertiary text-center">Active Tables</span>
          </div>
          <div className="card p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-accent">{activeOrders}</span>
            <span className="text-xs text-tertiary text-center">Live Orders</span>
          </div>
          <div className="card p-4 flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-warning">{occupancyRate}%</span>
            <span className="text-xs text-tertiary text-center">Occupancy</span>
          </div>
        </div>

        {/* Top sellers */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏆</span>
            <h2 className="heading-sm">Top Sellers Tonight</h2>
          </div>
          {fetching ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-hover rounded-xl animate-pulse" />)}
            </div>
          ) : topItems.length === 0 ? (
            <p className="text-tertiary text-sm text-center py-4">No orders yet tonight</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => {
                const pct = Math.round((item.count / topItems[0].count) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-tertiary font-bold text-sm w-4 shrink-0 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-primary font-semibold text-sm truncate">{item.name}</span>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-secondary text-xs tabular-nums">{item.count}x</span>
                          <span className="text-accent font-bold text-sm tabular-nums">€{item.revenue.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: i === 0 ? '#00D4FF' : i === 1 ? '#22C55E' : i === 2 ? '#F59E0B' : '#4A5B72',
                          }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hourly revenue */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-accent" />
            <h2 className="heading-sm">Hourly Revenue</h2>
            <span className="text-tertiary text-xs ml-auto">Last 9 hours</span>
          </div>
          <div className="flex items-end gap-1.5 h-20">
            {hourly.map((val, i) => {
              const maxVal = Math.max(...hourly, 1);
              const pct    = (val / maxVal) * 100;
              const isLast = i === hourly.length - 1;
              const barHour = (new Date().getHours() - 8 + i + 24) % 24;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(4, pct)}%`,
                      background: isLast
                        ? 'linear-gradient(180deg, #00D4FF, #0099CC)'
                        : 'rgba(0,212,255,0.3)',
                    }} />
                  <span className="text-[9px] text-tertiary font-mono">
                    {barHour.toString().padStart(2, '0')}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock */}
        <div className="card p-5 border-danger/30 bg-danger/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-danger" />
            <h2 className="heading-sm text-danger">Low Stock Alerts</h2>
            <span className="ml-auto badge badge-occupied">{LOW_STOCK.length}</span>
          </div>
          <div className="space-y-3">
            {LOW_STOCK.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Package size={14} className="text-danger shrink-0" />
                  <div className="min-w-0">
                    <p className="text-primary font-semibold text-sm">{item.name}</p>
                    <p className="text-danger/70 text-xs">Min: {item.minimum}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-danger font-bold text-sm">{item.current}</span>
                  <div className="w-16 h-1.5 bg-hover rounded-full overflow-hidden">
                    <div className="h-full bg-danger rounded-full" style={{ width: `${item.level * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <a href="/bar" className="card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Coffee size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-primary font-semibold text-sm">Bar View</p>
              <p className="text-tertiary text-xs">
                {orders.filter(o => o.destination === 'bar' && o.status !== 'delivered').length} active
              </p>
            </div>
          </a>
          <a href="/kitchen" className="card-hover p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
              <ChefHat size={18} className="text-warning" />
            </div>
            <div>
              <p className="text-primary font-semibold text-sm">Kitchen</p>
              <p className="text-tertiary text-xs">
                {orders.filter(o => o.destination === 'kitchen' && o.status !== 'delivered').length} active
              </p>
            </div>
          </a>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
