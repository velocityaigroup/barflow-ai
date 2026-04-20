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
      onClick={() => item.isAvailable && onTap(item)}
      className={`
        relative flex flex-col rounded-2xl overflow-hidden select-none
        bg-surface border border-border cursor-pointer
        transition-all duration-100 active:scale-95
        hover:border-accent/25 hover:bg-hover
        ${!item.isAvailable ? 'opacity-40 pointer-events-none' : ''}
      `}
      style={{ minHeight: '110px' }}
    >
      {/* HOT badge */}
      {item.isPopular && (
        <span className="absolute top-2 left-2 z-10 text-[9px] font-black text-warning uppercase tracking-widest">
          HOT
        </span>
      )}

      {/* Customize button */}
      {hasModifiers && onCustomize && item.isAvailable && (
        <button
          onClick={(e) => { e.stopPropagation(); onCustomize(item); }}
          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-lg bg-bg/80 border border-border
                     flex items-center justify-center hover:border-accent/40 transition-colors"
        >
          <SlidersHorizontal size={10} className="text-tertiary" />
        </button>
      )}

      {/* Emoji + name — fills available space */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 pt-4 pb-2 px-2">
        <span className="text-3xl leading-none">{item.emoji}</span>
        <span className="text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 px-1">
          {item.name}
        </span>
      </div>

      {/* Price bar — pinned to bottom */}
      <div className="flex items-center justify-between px-2.5 py-2 bg-hover/60 border-t border-border/60">
        <span className="text-[11px] font-bold text-accent tabular-nums">
          €{item.price.toFixed(2)}
        </span>
        <div className="w-5 h-5 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center">
          <Plus size={10} className="text-accent" />
        </div>
      </div>
    </div>
  );
}
