'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import { CATEGORIES, getItemsByCategory, MenuItem } from '@/data/menu';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { CartPanel } from '@/components/order/CartPanel';
import { MenuItemTile } from '@/components/order/MenuItemTile';
import { ModifierPanel } from '@/components/order/ModifierPanel';
import { ArrowLeft, Search, X } from 'lucide-react';

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tables, addToCart, openModifierPanel, cart } = useDemoStore();
  const [activeCat, setActiveCat] = useState('cocktails');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const table = tables.find((t) => t.id === id);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const items = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return CATEGORIES.flatMap((c) =>
        getItemsByCategory(c.id).filter(
          (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
        ),
      );
    }
    return getItemsByCategory(activeCat);
  }, [activeCat, search]);

  // Tap = instant add (no blocking popup). Customize button = opens modifier panel.
  const handleItemTap = (item: MenuItem) => {
    addToCart(item, [], '');
  };

  const handleCustomize = (item: MenuItem) => {
    openModifierPanel(item);
  };

  return (
    <div className="screen">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="btn-icon btn-ghost">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="heading-md leading-none">
              {table ? `Table ${table.number}` : 'Order'}
            </h1>
            {table && (
              <p className="text-tertiary text-xs mt-0.5">
                {table.section} · {table.capacity} seats
                {table.openedAt && ` · Since ${table.openedAt}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowSearch(!showSearch); setSearch(''); }}
            className={`btn-icon ${showSearch ? 'btn-secondary' : 'btn-ghost'}`}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>
          <StatusBar />
        </div>
      </header>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-3 border-b border-border shrink-0 animate-slide-down">
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="Search menu — Mojito, Burger, Beer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Category sidebar */}
        {!showSearch && (
          <aside className="flex flex-col w-[100px] sm:w-[120px] bg-bg border-r border-border py-3 gap-1 overflow-y-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`cat-tab flex-col px-2 py-3 rounded-none mx-2 rounded-xl text-center gap-1 ${
                  activeCat === cat.id ? 'active' : ''
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-[11px] leading-tight">{cat.name}</span>
              </button>
            ))}
          </aside>
        )}

        {/* CENTER: Menu grid */}
        <main className="flex-1 overflow-y-auto p-3 no-scrollbar">
          {/* Category header */}
          {!showSearch && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {CATEGORIES.find((c) => c.id === activeCat)?.emoji}
              </span>
              <h2 className="heading-sm">
                {CATEGORIES.find((c) => c.id === activeCat)?.name}
              </h2>
              <span className="text-tertiary text-sm ml-auto">{items.length} items</span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-tertiary">
              <span className="text-4xl">🔍</span>
              <p className="text-sm">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <MenuItemTile
                  key={item.id}
                  item={item}
                  onTap={handleItemTap}
                  onCustomize={handleCustomize}
                />
              ))}
            </div>
          )}
        </main>

        {/* RIGHT: Cart panel */}
        <CartPanel tableId={id} tableNumber={table?.number} />
      </div>

      {/* Modifier slide-up panel (opt-in via customize button) */}
      <ModifierPanel />

      <BottomNav />
    </div>
  );
}
