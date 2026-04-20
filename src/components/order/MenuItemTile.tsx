'use client';
import { MenuItem } from '@/data/menu';
import { Plus, SlidersHorizontal } from 'lucide-react';

interface Props {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
  onCustomize?: (item: MenuItem) => void;
}

export function MenuItemTile({ item, onTap, onCustomize }: Props) {
  const hasModifiers = item.modifierGroups && item.modifierGroups.length > 0;

  return (
    <div className={`menu-item relative flex flex-col ${!item.isAvailable ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Popular badge */}
      {item.isPopular && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-black text-warning uppercase tracking-widest">HOT</span>
        </div>
      )}

      {/* Customize button — only if item has modifier groups */}
      {hasModifiers && onCustomize && item.isAvailable && (
        <button
          onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-surface/80 border border-border
                     flex items-center justify-center hover:border-accent/40 active:scale-90 transition-all"
          title="Customize"
        >
          <SlidersHorizontal size={10} className="text-tertiary" />
        </button>
      )}

      {/* Main tap target — instant add to cart */}
      <button
        onClick={() => onTap(item)}
        className="flex flex-col items-center gap-1.5 flex-1 justify-center pt-3 pb-2 px-2 w-full text-center
                   active:bg-accent/5 transition-colors"
        disabled={!item.isAvailable}
      >
        <span className="text-3xl leading-none select-none">{item.emoji}</span>
        <span className="text-sm font-semibold text-primary text-center leading-tight line-clamp-2 px-1">
          {item.name}
        </span>
      </button>

      {/* Price + add — always visible, tappable */}
      <button
        onClick={() => onTap(item)}
        disabled={!item.isAvailable}
        className="flex items-center justify-between w-full px-3 py-2 border-t border-border/50
                   hover:bg-accent/5 active:bg-accent/10 transition-colors rounded-b-xl"
      >
        <span className="text-accent font-bold text-sm tabular-nums">
          €{item.price.toFixed(2)}
        </span>
        <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
          <Plus size={12} className="text-accent" />
        </div>
      </button>
    </div>
  );
}
