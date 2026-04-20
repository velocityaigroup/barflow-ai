'use client';
import { MenuItem as MenuItemType } from '@/data/menu';

interface Props {
  item: MenuItemType;
  onTap: (item: MenuItemType) => void;
  onCustomize: (item: MenuItemType) => void;
}

export function MenuItem({ item, onTap, onCustomize }: Props) {
  const hasModifiers = !!(item.modifierGroups && item.modifierGroups.length > 0);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#121821',
        border: '1px solid #1E2A3A',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: item.isAvailable ? 'pointer' : 'default',
        opacity: item.isAvailable ? 1 : 0.4,
        minHeight: '108px',
        transition: 'border-color 0.1s ease, background-color 0.1s ease, transform 0.1s ease',
        userSelect: 'none',
      }}
      onClick={() => item.isAvailable && onTap(item)}
      onMouseEnter={(e) => {
        if (item.isAvailable) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = 'rgba(0,212,255,0.3)';
          el.style.backgroundColor = '#1A2230';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = '#1E2A3A';
        el.style.backgroundColor = '#121821';
      }}
      onMouseDown={(e) => {
        if (item.isAvailable) {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      {/* HOT badge */}
      {item.isPopular && (
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '8px',
          fontSize: '9px',
          fontWeight: 900,
          color: '#F59E0B',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          zIndex: 2,
        }}>
          HOT
        </div>
      )}

      {/* Customize button */}
      {hasModifiers && item.isAvailable && (
        <button
          onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            border: '1px solid #1E2A3A',
            backgroundColor: 'rgba(11,15,20,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            color: '#4A5B72',
            fontSize: '11px',
            transition: 'border-color 0.1s, color 0.1s',
          }}
          title="Customize"
        >
          ⚙
        </button>
      )}

      {/* Emoji + Name — center content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 6px 6px',
        gap: '4px',
      }}>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>{item.emoji}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.25,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          padding: '0 2px',
        }}>
          {item.name}
        </span>
      </div>

      {/* Price bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderTop: '1px solid rgba(30,42,58,0.8)',
        backgroundColor: 'rgba(26,34,48,0.5)',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#00D4FF',
          fontVariantNumeric: 'tabular-nums',
        }}>
          €{item.price.toFixed(2)}
        </span>
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          backgroundColor: 'rgba(0,212,255,0.15)',
          border: '1px solid rgba(0,212,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00D4FF',
          fontSize: '14px',
          fontWeight: 700,
          lineHeight: 1,
        }}>
          +
        </div>
      </div>
    </div>
  );
}
