'use client';
import { useState, useMemo } from 'react';
import { CATEGORIES, MENU_ITEMS, MenuItem, Category } from '@/data/menu';
import { ShoppingCart, X, Plus, Minus, ChevronRight, ArrowLeft, Search, Star } from 'lucide-react';

// ─── Local cart types (no shared Zustand — this is customer-facing) ──────────
interface QrCartItem {
  uid: string;         // unique per cart entry
  item: MenuItem;
  qty: number;
}

// ─── Screens ─────────────────────────────────────────────────────────────────
type Screen = 'menu' | 'cart' | 'success';

export default function QrOrderPage({ params }: { params: { businessId: string } }) {
  const [activeCat, setActiveCat]   = useState<string>('cocktails');
  const [cart, setCart]             = useState<QrCartItem[]>([]);
  const [screen, setScreen]         = useState<Screen>('menu');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  const displayItems = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return MENU_ITEMS.filter(
        (i) => i.isAvailable && (
          i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        )
      );
    }
    return MENU_ITEMS.filter((i) => i.categoryId === activeCat && i.isAvailable);
  }, [activeCat, search]);

  // ── Cart actions ─────────────────────────────────────────────────────────
  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { uid: item.id + '_' + Date.now(), item, qty: 1 }];
    });
  };

  const increment = (uid: string) =>
    setCart((prev) => prev.map((c) => c.uid === uid ? { ...c, qty: c.qty + 1 } : c));

  const decrement = (uid: string) =>
    setCart((prev) => prev.map((c) => c.uid === uid ? { ...c, qty: c.qty - 1 } : c).filter((c) => c.qty > 0));

  const remove = (uid: string) => setCart((prev) => prev.filter((c) => c.uid !== uid));

  const getItemQty = (itemId: string) => cart.find((c) => c.item.id === itemId)?.qty ?? 0;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate network delay (demo — no real backend)
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setScreen('success');
  };

  const handleReorder = () => {
    setCart([]);
    setScreen('menu');
    setActiveCat('cocktails');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center gap-6 p-6 text-center">
        {/* Glow orb */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-success/20 blur-2xl scale-150" />
          <div className="relative w-24 h-24 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-primary">Order Received!</h1>
          <p className="text-secondary text-base max-w-xs">
            Your order has been sent to the bar. Staff will bring it to your table shortly.
          </p>
        </div>

        {/* Order summary */}
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-5 space-y-3 text-left">
          <p className="text-tertiary text-xs font-semibold uppercase tracking-widest">Your order</p>
          {cart.map((c) => (
            <div key={c.uid} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">{c.item.emoji}</span>
                <span className="text-primary font-semibold text-sm truncate">{c.item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-tertiary text-sm">×{c.qty}</span>
                <span className="text-accent font-bold text-sm tabular-nums">
                  €{(c.item.price * c.qty).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-secondary font-semibold">Total</span>
            <span className="text-primary font-black text-xl tabular-nums">€{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleReorder}
          className="btn-primary w-full max-w-sm py-4 text-base"
        >
          Order Again
        </button>

        <p className="text-tertiary text-xs">Powered by Velocity AI BarFlow</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CART SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === 'cart') {
    return (
      <div className="min-h-[100dvh] bg-bg flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0 sticky top-0 bg-bg z-10">
          <button onClick={() => setScreen('menu')} className="btn-icon btn-ghost">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="heading-md leading-none">Your Cart</h1>
            <p className="text-tertiary text-xs mt-0.5">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
          </div>
        </header>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-tertiary">
              <span className="text-5xl opacity-40">🛒</span>
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            cart.map((c) => (
              <div key={c.uid} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl shrink-0">
                  {c.item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-primary font-bold text-sm truncate">{c.item.name}</p>
                  <p className="text-accent font-bold text-sm tabular-nums mt-0.5">
                    €{(c.item.price * c.qty).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => decrement(c.uid)}
                    className="w-8 h-8 rounded-full bg-hover border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-border active:scale-95 transition-all"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-primary font-black w-5 text-center tabular-nums">{c.qty}</span>
                  <button
                    onClick={() => increment(c.uid)}
                    className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20 active:scale-95 transition-all"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order summary + CTA */}
        {cart.length > 0 && (
          <div className="px-4 pb-6 pt-3 border-t border-border space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-secondary font-semibold">Total</span>
              <span className="text-primary font-black text-2xl tabular-nums">€{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  Sending Order...
                </>
              ) : (
                <>
                  🚀 Place Order · €{cartTotal.toFixed(2)}
                </>
              )}
            </button>
            <p className="text-tertiary text-xs text-center">
              Staff will bring your order to the table
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MENU SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0 sticky top-0 bg-bg/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-lg">🍹</span>
          </div>
          <div>
            <h1 className="font-black text-primary text-base leading-none">Velocity Beach Club</h1>
            <p className="text-tertiary text-xs mt-0.5">Scan & Order</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSearch(!showSearch); setSearch(''); }}
            className={`btn-icon ${showSearch ? 'btn-secondary' : 'btn-ghost'}`}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>
          <button
            onClick={() => setScreen('cart')}
            className="relative btn-icon btn-ghost"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-bg text-[9px] font-black rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-3 border-b border-border shrink-0 animate-slide-down">
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

      {/* Category pills */}
      {!showSearch && (
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap shrink-0 border transition-all duration-150 active:scale-95 ${
                activeCat === cat.id
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-secondary border-border bg-surface hover:text-primary hover:border-muted'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar pb-32">
        {/* Category heading when browsing */}
        {!showSearch && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORIES.find((c) => c.id === activeCat)?.emoji}</span>
            <h2 className="heading-sm">{CATEGORIES.find((c) => c.id === activeCat)?.name}</h2>
            <span className="text-tertiary text-sm ml-auto">{displayItems.length} items</span>
          </div>
        )}

        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-tertiary">
            <span className="text-4xl">🔍</span>
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {displayItems.map((item) => {
              const qty = getItemQty(item.id);
              return (
                <div
                  key={item.id}
                  className="card flex flex-col overflow-hidden active:scale-95 transition-transform duration-100"
                >
                  {/* Emoji / image area */}
                  <div className="relative bg-gradient-to-br from-accent/8 to-accent/3 border-b border-border px-3 pt-4 pb-3 flex flex-col items-center gap-1">
                    {item.isPopular && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-warning/15 border border-warning/30 rounded-lg px-1.5 py-0.5">
                        <Star size={9} className="text-warning fill-warning" />
                        <span className="text-warning text-[9px] font-bold uppercase tracking-wide">Popular</span>
                      </div>
                    )}
                    <span className="text-4xl">{item.emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                      <p className="text-primary font-bold text-sm leading-tight">{item.name}</p>
                      <p className="text-tertiary text-[11px] mt-0.5 leading-tight line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-accent font-black text-base tabular-nums">€{item.price.toFixed(2)}</span>

                      {/* Add / qty control */}
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item)}
                          className="w-9 h-9 rounded-xl bg-accent text-bg font-black flex items-center justify-center text-lg hover:brightness-110 active:scale-90 transition-all shadow-glow-accent"
                        >
                          +
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const c = cart.find((c) => c.item.id === item.id);
                              if (c) decrement(c.uid);
                            }}
                            className="w-7 h-7 rounded-lg bg-hover border border-border flex items-center justify-center text-secondary hover:text-primary active:scale-90 transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-primary font-black w-4 text-center tabular-nums text-sm">{qty}</span>
                          <button
                            onClick={() => addItem(item)}
                            className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/25 active:scale-90 transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky cart CTA */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-bg via-bg/95 to-transparent">
          <button
            onClick={() => setScreen('cart')}
            className="btn-primary w-full py-4 text-base flex items-center justify-between px-6"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 font-black text-sm">
              {cartCount}
            </span>
            <span className="font-black">View Cart</span>
            <span className="font-bold tabular-nums">€{cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
