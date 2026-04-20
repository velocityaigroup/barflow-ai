'use client';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { TableBlock } from '@/components/floor/TableBlock';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default function OrderIndexPage() {
  const router = useRouter();
  const { tables, setActiveTable, cart } = useDemoStore();

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleTable = (tableId: string) => {
    setActiveTable(tableId);
    router.push(`/order/${tableId}`);
  };

  const freeTables  = tables.filter((t) => t.status === 'free');
  const activeTables = tables.filter((t) => t.status !== 'free');

  return (
    <div className="screen">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <ShoppingCart size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="heading-md leading-none">New Order</h1>
            <p className="text-tertiary text-xs mt-0.5">Select a table to start</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cartCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl">
              <ShoppingCart size={13} className="text-accent" />
              <span className="text-accent text-xs font-bold tabular-nums">{cartCount}</span>
            </div>
          )}
          <StatusBar />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">

        {/* Active / occupied tables first */}
        {activeTables.length > 0 && (
          <section>
            <h2 className="label text-secondary mb-3">Active Tables</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {activeTables.map((table) => (
                <TableBlock
                  key={table.id}
                  table={table}
                  onClick={() => handleTable(table.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Free tables */}
        {freeTables.length > 0 && (
          <section>
            <h2 className="label text-secondary mb-3">Free Tables</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {freeTables.map((table) => (
                <TableBlock
                  key={table.id}
                  table={table}
                  onClick={() => handleTable(table.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Walk-up / no table CTA */}
        <button
          onClick={() => router.push('/order/walkin')}
          className="card-hover w-full p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-xl">
              🚶
            </div>
            <div className="text-left">
              <p className="text-primary font-semibold text-sm">Walk-up / No Table</p>
              <p className="text-tertiary text-xs">Order without a table assignment</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-tertiary shrink-0" />
        </button>

      </div>

      <BottomNav />
    </div>
  );
}
