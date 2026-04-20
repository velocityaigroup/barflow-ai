'use client';
import { useDemoStore } from '@/store/useDemoStore';
import { useRouter } from 'next/navigation';

interface Props {
  tableId: string;
  tableNumber?: number;
}

export function CartPanel({ tableId, tableNumber }: Props) {
  const { cart, updateQty, removeFromCart, clearCart, submitOrder, submitting } = useDemoStore();
  const router = useRouter();

  const total     = cart.reduce((s, i) => s + i.totalPrice, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleSend = async () => {
    if (cart.length === 0 || submitting) return;
    await submitOrder(tableId);
    router.push('/bar');
  };

  return (
    <div
      style={{
        width: '272px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #1E2A3A',
        backgroundColor: '#121821',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid #1E2A3A',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
            Order {tableNumber ? `— Table ${tableNumber}` : ''}
          </div>
          {itemCount > 0 && (
            <div style={{ fontSize: '12px', color: '#4A5B72', marginTop: '2px' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              fontSize: '12px',
              color: '#4A5B72',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Cart items — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {cart.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#4A5B72',
            gap: '10px',
            padding: '40px 16px',
          }}>
            <span style={{ fontSize: '36px', opacity: 0.4 }}>🛒</span>
            <span style={{ fontSize: '13px', textAlign: 'center', lineHeight: 1.5 }}>
              Tap menu items to add them to the order
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 6px',
                  borderRadius: '8px',
                  borderBottom: '1px solid rgba(30,42,58,0.6)',
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.menuItem.emoji}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.menuItem.name}
                  </div>
                  {item.selectedModifiers.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#4A5B72', marginTop: '2px' }}>
                      {item.selectedModifiers.map(m => m.name).join(' · ')}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#00D4FF', marginTop: '3px' }}>
                    €{item.totalPrice.toFixed(2)}
                  </div>
                </div>

                {/* Qty controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: '1px solid #1E2A3A',
                      backgroundColor: '#1A2230',
                      color: '#8B9BB4',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: '1px solid #1E2A3A',
                      backgroundColor: '#1A2230',
                      color: '#8B9BB4',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — total + send button */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #1E2A3A',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'rgba(11,15,20,0.5)',
      }}>
        {cart.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '14px', color: '#8B9BB4' }}>Total</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
              €{total.toFixed(2)}
            </span>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={cart.length === 0 || submitting}
          style={{
            width: '100%',
            minHeight: '48px',
            borderRadius: '12px',
            border: 'none',
            background: cart.length === 0
              ? '#1A2230'
              : 'linear-gradient(135deg, #00D4FF, #0099CC)',
            color: cart.length === 0 ? '#4A5B72' : '#0B0F14',
            fontSize: '16px',
            fontWeight: 900,
            cursor: cart.length === 0 || submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            boxShadow: cart.length > 0
              ? '0 0 20px rgba(0,212,255,0.3)'
              : 'none',
          }}
        >
          {submitting ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(11,15,20,0.3)',
                borderTopColor: '#0B0F14',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              Sending...
            </>
          ) : cart.length === 0 ? (
            'Add items to order'
          ) : (
            <>
              <span style={{ fontSize: '18px' }}>📤</span>
              Send to Bar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
