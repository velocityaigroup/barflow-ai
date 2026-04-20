'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import { CATEGORIES, getItemsByCategory, MenuItem } from '@/data/menu';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { MenuItemTile } from '@/components/order/MenuItemTile';
import { ModifierPanel } from '@/components/order/ModifierPanel';
import { CartDrawer } from '@/components/order/CartDrawer';
import { ArrowLeft, Search, X, ShoppingCart, Send } from 'lucide-react';

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tables, addToCart, openModifierPanel, cart, submitOrder, submitting } = useDemoStore();
  const [activeCat, setActiveCat] = useState('cocktails');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const table = tables.find((t) => t.id === id);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.totalPrice, 0);

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

  const handleItemTap = (item: MenuItem) => {
    addToCart(item, [], '');
  };

  const handleCustomize = (item: MenuItem) => {
    openModifierPanel(item);
  };

  const handleSend = async () => {
    if (cart.length === 0 || submitting) return;
    setShowCart(false);
    await submitOrder(id);
    router.push('/bar');
  };

  return (
    <div className="screen">
      {/* ── Header ─────────────────────────────────────────── */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSearch(!showSearch); setSearch(''); }}
            className={`btn-icon ${showSearch ? 'btn-secondary' : 'btn-ghost'}`}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>
          <StatusBar />
        </div>
      </header>

      {/* ── Search bar ─────────────────────────────────────── */}
      {showSearch && (
        <div className="px-4 py-3 border-b border-border shrink-0">
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="Search — Mojito, Burger, Beer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── Category tabs (horizontal scroll) ──────────────── */}
      {!showSearch && (
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar border-b border-border shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
                          whitespace-nowrap shrink-0 transition-all duration-150 border
                          ${activeCat === cat.id
                            ? 'bg-accent/10 text-accent border-accent/30'
                            : 'text-secondary hover:text-primary hover:bg-hover border-transparent'
                          }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Menu grid (full width, scrollable) ─────────────── */}
      <main className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-tertiary">
            <span className="text-4xl">🔍</span>
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
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
        {/* Bottom padding so last row isn't hidden behind cart bar */}
        <div className="h-4" />
      </main>

      {/* ── Sticky cart bar ────────────────────────────────── */}
      <div className="shrink-0 px-3 py-2 border-t border-border bg-surface">
        {cartCount === 0 ? (
          <div className="flex items-center justify-center gap-2 py-2 text-tertiary text-sm">
            <ShoppingCart size={16} className="opacity-50" />
            <span>Tap items to add to order</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Cart summary — tap to view/edit */}
            <button
              onClick={() => setShowCart(true)}
              className="flex-1 flex items-center gap-3 bg-hover rounded-xl px-4 py-3 border border-border hover:border-accent/30 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                <span className="text-accent font-black text-sm">{cartCount}</span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-primary font-semibold text-sm leading-none">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
                <p className="text-accent font-bold text-xs mt-0.5">€{cartTotal.toFixed(2)}</p>
              </div>
              <span className="text-tertiary text-xs">View</span>
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={submitting}
              className="btn-primary shrink-0 gap-2 px-5 py-3 font-black"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}
      </div>

      {/* ── Cart drawer (slide-up) ──────────────────────────── */}
      <CartDrawer
        tableId={id}
        tableNumber={table?.number}
        open={showCart}
        onClose={() => setShowCart(false)}
        onSend={handleSend}
      />

      {/* ── Modifier panel ──────────────────────────────────── */}
      <ModifierPanel />

      <BottomNav />
    </div>
  );
}
