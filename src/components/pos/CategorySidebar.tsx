'use client';
import { Category } from '@/data/menu';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

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
        {categories.map((cat) => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 10px',
                borderRadius: '10px',
                border: active ? '1px solid rgba(0,212,255,0.35)' : '1px solid transparent',
                backgroundColor: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: active ? '#00D4FF' : '#8B9BB4',
                fontWeight: active ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                textAlign: 'left',
                width: '100%',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1A2230';
                  (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4';
                }
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{cat.emoji}</span>
              <span style={{ lineHeight: 1.2 }}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
