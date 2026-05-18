'use client';
import { useState, useMemo } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { Category, CATEGORIES, MenuItem as MenuItemType } from '@/data/menu';
import { MenuItem } from './MenuItem';
import { ShoppingCart, X, Minus, Plus, Send } from 'lucide-react';

const catDestMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.destination ?? 'bar']));

interface Props {
  categories:      Category[];
  activeId:        string;
  onSelectCat:     (id: string) => void;
  items:           MenuItemType[];
  onTap:           (item: MenuItemType) => void;
  onCustomize:     (item: MenuItemType) => void;
  tableId:         string;
  tableNumber?:    number;
  categoryEmoji?:  string;
  categoryName?:   string;
  /** Live cart quantity per menuItem.id — drives the in-tile badge. */
  cartQtyMap?:     Record<string, number>;
}

/**
 * MobilePosView — responsive single-column POS for viewports < 640px.
 *
 * Layout:
 *   ┌─────────────────────────────┐
 *   │  Horizontal category tabs   │ ← overflow-x scroll
 *   ├─────────────────────────────┤
 *   │  Menu grid (2 cols)         │ ← scrollable
 *   ├─────────────────────────────┤
 *   │  Floating cart bar          │ ← fixed bottom, opens drawer
 *   └─────────────────────────────┘
 */
export function MobilePosView({
  categories, activeId, onSelectCat, items,
  onTap, onCustomize, tableId, tableNumber,
  categoryEmoji, categoryName, cartQtyMap = {},
}: Props) {
  const { cart, updateQty, removeFromCart, clearCart, submitOrder, submitting } = useDemoStore();
  const [cartOpen, setCartOpen] = useState(false);

  const total     = cart.reduce((s, i) => s + i.totalPrice, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const sendLabel = useMemo(() => {
    if (cart.length === 0) return 'Send Order';
    const dests = new Set(cart.map((ci) => catDestMap[ci.menuItem.categoryId] ?? 'bar'));
    if (dests.size > 1)       return 'Send Order 📤';
    if (dests.has('kitchen')) return 'Send to Kitchen 🍽️';
    return 'Send to Bar 🍹';
  }, [cart]);

  const handleSend = async () => {
    if (cart.length === 0 || submitting) return;
    await submitOrder(tableId);
    setCartOpen(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* ── Category tab strip ──────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-border shrink-0"
        style={{ backgroundColor: '#0B0F14' }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCat(cat.id)}
            className={`cat-tab shrink-0${cat.id === activeId ? ' active' : ''}`}
            style={{ minHeight: '40px', padding: '6px 12px' }}
          >
            <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ── Category label ──────────────────────────────────── */}
      {categoryName && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0"
          style={{ backgroundColor: '#0B0F14', borderBottom: '1px solid rgba(30,42,58,0.5)' }}
        >
          {categoryEmoji && <span style={{ fontSize: '18px' }}>{categoryEmoji}</span>}
          <span className="text-primary font-semibold" style={{ fontSize: '15px' }}>{categoryName}</span>
          <span className="text-tertiary text-xs ml-auto">{items.length} items</span>
        </div>
      )}

      {/* ── Menu grid — 2 columns on mobile ─────────────────── */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{ padding: '8px', paddingBottom: itemCount > 0 ? '72px' : '8px' }}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-tertiary gap-3">
            <span style={{ fontSize: '36px', opacity: 0.4 }}>🔍</span>
            <span className="text-sm">No items found</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              alignContent: 'start',
            }}
          >
            {items.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onTap={onTap}
                onCustomize={onCustomize}
                cartQty={cartQtyMap[item.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating cart bar (only when cart has items) ─────── */}
      {itemCount > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border"
          style={{
            backgroundColor: 'rgba(18,24,33,0.98)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full btn-primary btn-lg flex items-center justify-between px-5"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>
            <span className="font-black tabular-nums">€{total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── Cart drawer overlay ──────────────────────────────── */}
      {cartOpen && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-20"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer panel — slides up from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-3xl border-t border-border animate-slide-up"
            style={{
              backgroundColor: '#121821',
              maxHeight: '80dvh',
            }}
          >
            {/* Drawer handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <div>
                <p className="text-primary font-bold">
                  Order{tableNumber ? ` — Table ${tableNumber}` : ''}
                </p>
                <p className="text-tertiary text-xs mt-0.5">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-tertiary hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  className="btn-icon btn-ghost w-9 h-9"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.menuItem.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-primary font-semibold text-sm truncate">{item.menuItem.name}</p>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-tertiary text-xs mt-0.5">
                        {item.selectedModifiers.map((m) => m.name).join(' · ')}
                      </p>
                    )}
                    <p className="text-accent font-bold text-sm mt-0.5 tabular-nums">
                      €{item.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-primary font-bold text-sm w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-border shrink-0 space-y-3" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Total</span>
                <span className="text-3xl font-black text-white tabular-nums">€{total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleSend}
                disabled={submitting}
                className="btn-primary btn-lg w-full gap-3"
              >
                {submitting ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full"
                      style={{ animation: 'spin 0.7s linear infinite' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {sendLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
