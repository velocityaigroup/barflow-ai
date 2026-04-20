'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { TableBlock } from '@/components/floor/TableBlock';
import { TableStatus } from '@/data/tables';
import { LayoutGrid, Users, TrendingUp } from 'lucide-react';

const SECTIONS = ['All', 'Indoor', 'Terrace', 'Beach'];

export default function FloorPage() {
  const router = useRouter();
  const { tables, setActiveTable } = useDemoStore();
  const [section, setSection] = useState('All');

  const filtered = tables.filter(
    (t) => section === 'All' || t.section === section,
  );

  const stats = {
    free:     tables.filter((t) => t.status === 'free').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    ordering: tables.filter((t) => t.status === 'ordering').length,
  };

  const totalRevenue = tables.reduce((sum, t) => sum + (t.currentTotal || 0), 0);

  const handleTable = (tableId: string, status: TableStatus) => {
    setActiveTable(tableId);
    const table = tables.find((t) => t.id === tableId);
    router.push(`/order/${tableId}`);
  };

  return (
    <div className="screen">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <LayoutGrid size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="heading-md leading-none">Floor Plan</h1>
            <p className="text-tertiary text-xs mt-0.5">Velocity Beach Club</p>
          </div>
        </div>
        <StatusBar />
      </header>

      {/* Stats row */}
      <div className="flex items-stretch gap-2 px-4 py-3 shrink-0">
        <div className="flex-1 bg-success/8 border border-success/20 rounded-xl px-3 py-2.5 flex flex-col items-center">
          <span className="text-xl font-black text-success">{stats.free}</span>
          <span className="text-[10px] font-semibold text-success/60 uppercase tracking-wide mt-0.5">Free</span>
        </div>
        <div className="flex-1 bg-danger/8 border border-danger/20 rounded-xl px-3 py-2.5 flex flex-col items-center">
          <span className="text-xl font-black text-danger">{stats.occupied}</span>
          <span className="text-[10px] font-semibold text-danger/60 uppercase tracking-wide mt-0.5">Active</span>
        </div>
        <div className="flex-1 bg-warning/8 border border-warning/20 rounded-xl px-3 py-2.5 flex flex-col items-center">
          <span className="text-xl font-black text-warning">{stats.ordering}</span>
          <span className="text-[10px] font-semibold text-warning/60 uppercase tracking-wide mt-0.5">Ordering</span>
        </div>
        <div className="flex-[1.5] bg-accent/8 border border-accent/20 rounded-xl px-3 py-2.5 flex flex-col items-center">
          <span className="text-xl font-black text-accent">€{totalRevenue.toFixed(0)}</span>
          <span className="text-[10px] font-semibold text-accent/60 uppercase tracking-wide mt-0.5">Tonight</span>
        </div>
      </div>

      {/* Section filter */}
      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto no-scrollbar shrink-0">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
              section === s
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-tertiary hover:text-secondary hover:bg-hover border border-transparent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filtered.map((table) => (
            <TableBlock
              key={table.id}
              table={table}
              onClick={() => handleTable(table.id, table.status)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 py-4 mt-2">
          {[
            { color: 'bg-success', label: 'Free' },
            { color: 'bg-danger',  label: 'Active' },
            { color: 'bg-warning', label: 'Ordering' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-tertiary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
