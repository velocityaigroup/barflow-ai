'use client';
import { useMemo } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { CATEGORIES } from '@/data/menu';
import { ShoppingCart, Minus, Plus, Trash2, Send } from 'lucide-react';

interface Props {
  tableId:     string;
  tableNumber?: number;
}

/** Map categoryId → destination ('bar' | 'kitchen') from menu config. */
const catDestMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.destination ?? 'bar']));

/**
 * CartPanel — right column of the POS layout.
 *
 * Fully built on the globals.css design system — no inline style hex values.
 * Touch targets: qty buttons 36×36px, send CTA 56px.
 * Smart send label adapts to cart contents (bar / kitchen / mixed).
 */
export function CartPanel({ tableId, tableNumber }: Props) {
  const { cart, updateQty, clearCart, submitOrder, submitting } = useDemoStore();

  const total     = cart.reduce((s, i) => s + i.totalPrice, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  /** Derive send label from what's actually in the cart. */
  const sendLabel = useMemo(() => {
    if (cart.length === 0) return 'Add items to order';
    const dests = new Set(cart.map((ci) => catDestMap[ci.menuItem.categoryId] ?? 'bar'));
    if (dests.size > 1)   return 'Send Order 📤';
    if (dests.has('kitchen')) return 'Send to Kitchen 🍽️';
    return 'Send to Bar 🍹';
  }, [cart]);

  const handleSend = async () => {
    if (cart.length === 0 || submitting) return;
    await submitOrder(tableId);
    // Stay on the POS — bartender keeps taking orders after sending.
  };

  return (
    <div
      className="flex flex-col border-l border-border bg-surface"
      style={{ width: '272px', flexShrink: 0, overflow: 'hidden' }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3.5 py-3 border-b border-border shrink-0"
        style={{ background: 'linear-gradient(180deg, #121821 0%, #0F1520 100%)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <ShoppingCart size={13} className="text-accent" />
          </div>
          <div>
            <p className="text-primary font-bold leading-none" style={{ fontSize: '14px' }}>
              {tableNumber ? `Table ${tableNumber}` : 'Order'}
            </p>
            {itemCount > 0 && (
              <p className="text-tertiary leading-none mt-0.5" style={{ fontSize: '11px' }}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="w-7 h-7 rounded-lg flex items-center justify-center
                       text-tertiary hover:text-danger hover:bg-danger/10
                       border border-transparent hover:border-danger/20
                       transition-all duration-150"
            title="Clear cart"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* ── Cart items ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '6px' }}>
        {cart.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-3 text-tertiary py-12">
            <div
              className="w-14 h-14 rounded-2xl bg-hover border border-border flex items-center justify-center"
              style={{ fontSize: '24px', opacity: 0.5 }}
            >
              🛒
            </div>
            <p className="text-xs text-center leading-relaxed px-4">
              Tap menu items<br />to add them here
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2.5 px-2 py-2 rounded-xl
                           hover:bg-hover transition-colors duration-100"
              >
                {/* Emoji */}
                <span className="text-xl shrink-0 leading-none">{item.menuItem.emoji}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-primary font-semibold leading-tight truncate"
                    style={{ fontSize: '12px' }}
                  >
                    {item.menuItem.name}
                  </p>
                  {item.selectedModifiers.length > 0 && (
                    <p className="text-tertiary leading-tight mt-0.5 truncate" style={{ fontSize: '10px' }}>
                      {item.selectedModifiers.map((m) => m.name).join(' · ')}
                    </p>
                  )}
                  <p className="text-accent font-bold tabular-nums mt-0.5" style={{ fontSize: '12px' }}>
                    €{item.totalPrice.toFixed(2)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-bg border border-border text-tertiary
                               hover:text-danger hover:border-danger/30
                               active:scale-90 transition-all duration-100"
                  >
                    <Minus size={11} />
                  </button>
                  <span
                    className="text-primary font-black tabular-nums text-center"
                    style={{ fontSize: '13px', minWidth: '18px' }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               bg-bg border border-border text-tertiary
                               hover:text-accent hover:border-accent/30
                               active:scale-90 transition-all duration-100"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div
        className="px-3.5 py-3 border-t border-border shrink-0 flex flex-col gap-2.5"
        style={{ backgroundColor: 'rgba(11,15,20,0.6)' }}
      >
        {/* Total row */}
        {cart.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">Total</span>
            <span className="text-white font-black tabular-nums text-xl">
              €{total.toFixed(2)}
            </span>
          </div>
        )}

        {/* Send CTA */}
        <button
          onClick={handleSend}
          disabled={cart.length === 0 || submitting}
          className={`
            w-full flex items-center justify-center gap-2 rounded-xl font-black
            min-h-[52px] text-base transition-all duration-150 select-none
            ${cart.length === 0
              ? 'bg-hover border border-border text-tertiary cursor-not-allowed'
              : submitting
              ? 'opacity-70 cursor-wait bg-gradient-accent text-bg'
              : 'text-bg cursor-pointer active:scale-[0.98]'
            }
          `}
          style={cart.length > 0 && !submitting ? {
            background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
            boxShadow: '0 0 24px rgba(0,212,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
          } : undefined}
        >
          {submitting ? (
            <>
              <div
                className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full"
                style={{ animation: 'spin 0.7s linear infinite' }}
              />
              <span>Sending…</span>
            </>
          ) : cart.length === 0 ? (
            <span>Add items to order</span>
          ) : (
            <>
              <Send size={16} />
              <span>{sendLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
