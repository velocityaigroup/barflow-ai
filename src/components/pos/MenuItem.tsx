'use client';
import { memo } from 'react';
import { MenuItem as MenuItemType } from '@/data/menu';

interface Props {
  item:         MenuItemType;
  onTap:        (item: MenuItemType) => void;
  onCustomize:  (item: MenuItemType) => void;
  /** Quantity already in the active cart — drives the in-tile badge. */
  cartQty?:     number;
}

/**
 * MenuItem tile — memoized so cart updates don't re-render the entire grid.
 *
 * Hover/active states driven by the `.menu-item` CSS class in globals.css.
 * No JS DOM mutation.
 */
export const MenuItem = memo(function MenuItem({ item, onTap, onCustomize, cartQty = 0 }: Props) {
  const hasModifiers = !!(item.modifierGroups && item.modifierGroups.length > 0);

  return (
    <div
      className={`menu-item${item.isAvailable ? '' : ' unavailable'}`}
      onClick={() => item.isAvailable && onTap(item)}
      role="button"
      tabIndex={item.isAvailable ? 0 : -1}
      onKeyDown={(e) => e.key === 'Enter' && item.isAvailable && onTap(item)}
    >
      {/* HOT badge */}
      {item.isPopular && (
        <div
          className="absolute top-1.5 left-2 text-warning font-black tracking-widest uppercase z-10"
          style={{ fontSize: '9px' }}
        >
          HOT
        </div>
      )}

      {/* Customize button */}
      {hasModifiers && item.isAvailable && (
        <button
          onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg border border-border
                     bg-bg/80 flex items-center justify-center text-tertiary
                     hover:border-accent/40 hover:text-accent transition-all duration-100 z-10"
          style={{ fontSize: '11px' }}
          title="Customize"
        >
          ⚙
        </button>
      )}

      {/* Emoji + Name */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-1.5 pt-2.5 pb-1.5">
        <span style={{ fontSize: '26px', lineHeight: 1 }}>{item.emoji}</span>
        <span
          className="text-primary font-semibold text-center leading-tight"
          style={{
            fontSize: '11px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </span>
      </div>

      {/* Price bar */}
      <div
        className="flex items-center justify-between px-2 py-1.5 border-t border-border/80"
        style={{ backgroundColor: 'rgba(26,34,48,0.5)' }}
      >
        <span className="text-accent font-bold tabular-nums" style={{ fontSize: '13px' }}>
          €{item.price.toFixed(2)}
        </span>
        {cartQty > 0 ? (
          <div
            className="flex items-center justify-center rounded-md font-black text-bg"
            style={{
              fontSize: '10px', lineHeight: 1,
              minWidth: '20px', height: '20px', padding: '0 4px',
              background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
              boxShadow: '0 0 8px rgba(0,212,255,0.45)',
            }}
          >
            ×{cartQty}
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center font-bold
                       bg-accent/15 border border-accent/30 text-accent"
            style={{ fontSize: '14px', lineHeight: 1 }}
          >
            +
          </div>
        )}
      </div>
    </div>
  );
});
