'use client';
import { MenuItem } from '@/data/menu';
import { Plus } from 'lucide-react';

interface Props {
  item: MenuItem;
  onTap: (item: MenuItem) => void;
}

export function MenuItemTile({ item, onTap }: Props) {
  return (
    <button
      onClick={() => item.isAvailable && onTap(item)}
      className={`menu-item group text-left w-full ${!item.isAvailable ? 'unavailable' : ''}`}
    >
      {/* Popular badge */}
      {item.isPopular && (
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-black text-warning uppercase tracking-widest">HOT</span>
        </div>
      )}

      {/* Emoji / icon */}
      <div className="flex flex-col items-center gap-1.5 flex-1 justify-center pt-1">
        <span className="text-3xl leading-none select-none">{item.emoji}</span>
        <span className="text-sm font-semibold text-primary text-center leading-tight line-clamp-2">
          {item.name}
        </span>
      </div>

      {/* Price + add indicator */}
      <div className="flex items-center justify-between w-full mt-auto">
        <span className="text-accent font-bold text-sm">
          €{item.price.toFixed(2)}
        </span>
        <div className="w-6 h-6 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={12} className="text-accent" />
        </div>
      </div>
    </button>
  );
}
