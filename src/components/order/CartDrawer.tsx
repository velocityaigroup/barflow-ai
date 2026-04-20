'use client';
import { useEffect, useState } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { Minus, Plus, Trash2, Send, X, ShoppingBag } from 'lucide-react';

interface Props {
  tableId: string;
  tableNumber?: number;
  open: boolean;
  onClose: () => void;
  onSend: () => void;
}

export function CartDrawer({ tableId, tableNumber, open, onClose, onSend }: Props) {
  const { cart, updateQty, removeFromCart, clearCart, submitting } = useDemoStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 250);
  }, [open]);

  if (!visible && !open) return null;

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-250
                    ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] flex flex-col
                       bg-surface rounded-t-3xl border-t border-border shadow-2xl
                       transition-transform duration-250
                       ${open ? 'translate-y-0' : 'translate-y-full'}`}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-primary text-lg">Order</h2>
            {tableNumber && (
              <p className="text-tertiary text-xs mt-0.5">Table {tableNumber} · {itemCount} item{itemCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-tertiary hover:text-danger transition-colors px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="btn-icon btn-ghost w-9 h-9">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-tertiary">
              <ShoppingBag size={36} className="opacity-30" />
              <p className="text-sm text-center">No items yet — tap menu items to add them</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item) => {
                const unitPrice = item.menuItem.price +
                  item.selectedModifiers.reduce((s, m) => s + m.priceAdjustment, 0);
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <span className="text-2xl shrink-0">{item.menuItem.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-semibold text-sm leading-tight truncate">
                        {item.menuItem.name}
                      </p>
                      {item.selectedModifiers.length > 0 && (
                        <p className="text-tertiary text-xs mt-0.5 truncate">
                          {item.selectedModifiers.map((m) => m.name).join(' · ')}
                        </p>
                      )}
                      {item.customNote && (
                        <p className="text-warning/80 text-xs mt-0.5 italic truncate">
                          📝 {item.customNote}
                        </p>
                      )}
                      <p className="text-accent font-bold text-sm mt-1">
                        €{item.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-hover border border-border flex items-center justify-center
                                   text-secondary hover:text-primary hover:border-accent/30 transition-all active:scale-90"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-primary font-bold text-sm w-5 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-hover border border-border flex items-center justify-center
                                   text-secondary hover:text-primary hover:border-accent/30 transition-all active:scale-90"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-tertiary hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-border bg-bg/50 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-secondary text-sm">Total</span>
              <span className="text-primary font-black text-2xl tabular-nums">€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onSend}
              disabled={submitting}
              className="btn-primary w-full btn-lg font-black gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  Sending order...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send to Bar — €{total.toFixed(2)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
