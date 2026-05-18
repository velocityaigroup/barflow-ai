'use client';
import { Category } from '@/data/menu';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * CategorySidebar — vertical category picker for the POS.
 *
 * Uses CSS-only hover/active states — no JS DOM mutation.
 * The `cat-tab` + `.active` classes come from globals.css design system.
 */
export function CategorySidebar({ categories, activeId, onSelect }: Props) {
  return (
    <div
      style={{
        width: '176px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid #1E2A3A',
        backgroundColor: '#0B0F14',
      }}
    >
      <div style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`cat-tab w-full text-left${cat.id === activeId ? ' active' : ''}`}
          >
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{cat.emoji}</span>
            <span style={{ lineHeight: 1.2 }}>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
