'use client';
import { memo } from 'react';
import { MenuItem as MenuItemType } from '@/data/menu';
import { MenuItem } from './MenuItem';

interface Props {
  items:          MenuItemType[];
  onTap:          (item: MenuItemType) => void;
  onCustomize:    (item: MenuItemType) => void;
  categoryName?:  string;
  categoryEmoji?: string;
  /** Live cart quantity per menuItem.id — passed down to each tile for the in-cart badge. */
  cartQtyMap?:    Record<string, number>;
}

/**
 * MenuGrid — centre column of the POS layout.
 *
 * Memoized at the grid level — only re-renders when items/category changes,
 * not on every cart update.
 */
export const MenuGrid = memo(function MenuGrid({
  items, onTap, onCustomize, categoryName, categoryEmoji, cartQtyMap = {},
}: Props) {
  return (
    <div
      className="flex flex-col bg-bg overflow-hidden"
      style={{ flex: 1, minWidth: 0 }}
    >
      {/* ── Category header ──────────────────────────────── */}
      {categoryName && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border shrink-0"
             style={{ background: 'linear-gradient(180deg, rgba(18,24,33,0.8) 0%, transparent 100%)' }}>
          {categoryEmoji && (
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{categoryEmoji}</span>
          )}
          <span className="text-primary font-bold" style={{ fontSize: '16px' }}>
            {categoryName}
          </span>
          <span className="text-tertiary text-xs ml-auto tabular-nums">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* ── Scrollable grid ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-tertiary">
            <span style={{ fontSize: '36px', opacity: 0.35 }}>🔍</span>
            <span className="text-sm">No items in this category</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
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
    </div>
  );
});
