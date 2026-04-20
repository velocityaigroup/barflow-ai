'use client';
import { useDemoStore } from '@/store/useDemoStore';
import { Minus, Plus, Trash2, Send, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  tableId: string;
  tableNumber?: number;
}

export function CartPanel({ tableId, tableNumber }: Props) {
  const { cart, updateQty, removeFromCart, clearCart, submitOrder } = useDemoStore();
  const router = useRouter();

  const total = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleSend = () => {
    if (cart.length === 0) return;
    submitOrder(tableId);
    router.push('/bar');
  };

  return (
    <aside className="flex flex-col bg-surface border-l border-border w-56 xl:w-64 shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-primary text-md">Cart</h2>
          {tableNumber && (
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20">
              T{tableNumber}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <p className="text-tertiary text-xs mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-tertiary">
            <ShoppingBag size={32} className="opacity-30" />
            <p className="text-xs text-center leading-relaxed">
              Tap menu items<br />to add them here
            </p>
          </div>
        ) : (
          <div>
            {cart.map((item) => {
              const unitPrice = item.menuItem.price + item.selectedModifiers.reduce((s, m) => s + m.priceAdjustment, 0);
              return (
                <div key={item.id} className="cart-item animate-fade-in">
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <p className="text-primary font-semibold text-sm truncate leading-tight">
                      {item.menuItem.name}
                    </p>
                    {/* Modifiers */}
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-tertiary text-xs mt-0.5 truncate">
                        {item.selectedModifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {item.customNote && (
                      <p className="text-warning/70 text-xs mt-0.5 italic truncate">
                        📝 {item.customNote}
                      </p>
                    )}
                    {/* Price */}
                    <p className="text-accent font-bold text-sm mt-1">
                      €{item.totalPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="qty-btn w-6 h-6"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-primary text-xs font-bold w-4 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="qty-btn w-6 h-6"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-tertiary hover:text-danger transition-colors p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border shrink-0 space-y-3">
        {cart.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">Total</span>
            <span className="text-primary font-black text-xl tabular-nums">
              €{total.toFixed(2)}
            </span>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={cart.length === 0}
          className="btn-primary w-full btn-lg font-black text-md gap-2"
        >
          <Send size={18} />
          Send to Bar
        </button>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="w-full text-tertiary text-xs py-1.5 hover:text-secondary transition-colors"
          >
            Clear cart
          </button>
        )}
      </div>
    </aside>
  );
}
