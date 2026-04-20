'use client';
import { MenuItem } from '@/data/menu';
import { Plus, SlidersHorizontal } from 'lucide-react';

interface Props {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
  onCustomize?: (item: MenuItem) => void;
}

export function MenuItemTile({ item, onTap, onCustomize }: Props) {
  const hasModifiers = !!(item.modifierGroups && item.modifierGroups.length > 0);

  return (
    <div
      className={`menu-item w-full ${!item.isAvailable ? 'unavailable' : ''}`}
      onClick={() => item.isAvailable && onTap(item)}
    >
      {/* Popular badge */}
      {item.isPopular && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-black text-warning uppercase tracking-widest">HOT</span>
        </div>
      )}

      {/* Customize icon — absolutely positioned, stops propagation */}
      {hasModifiers && onCustomize && item.isAvailable && (
        <div
          onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-surface border border-border
                     flex items-center justify-center cursor-pointer hover:border-accent/40 transition-colors"
        >
          <SlidersHorizontal size={10} className="text-tertiary" />
        </div>
      )}

      {/* Emoji + name (vertically centered) */}
      <div className="flex flex-col items-center gap-1.5 flex-1 justify-center">
        <span className="text-3xl leading-none select-none">{item.emoji}</span>
        <span className="text-sm font-semibold text-primary text-center leading-tight line-clamp-2">
          {item.name}
        </span>
      </div>

      {/* Price + always-visible add button */}
      <div className="flex items-center justify-between w-full mt-auto">
        <span className="text-accent font-bold text-sm tabular-nums">
          €{item.price.toFixed(2)}
        </span>
        <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
          <Plus size={12} className="text-accent" />
        </div>
      </div>
    </div>
  );
}
