'use client';
import { MenuItem as MenuItemType } from '@/data/menu';
import { MenuItem } from './MenuItem';

interface Props {
  items: MenuItemType[];
  onTap: (item: MenuItemType) => void;
  onCustomize: (item: MenuItemType) => void;
  categoryName?: string;
  categoryEmoji?: string;
}

export function MenuGrid({ items, onTap, onCustomize, categoryName, categoryEmoji }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#0B0F14',
        minWidth: 0,
      }}
    >
      {/* Category header */}
      {categoryName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px 8px',
          borderBottom: '1px solid #1E2A3A',
          flexShrink: 0,
        }}>
          {categoryEmoji && <span style={{ fontSize: '22px' }}>{categoryEmoji}</span>}
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>{categoryName}</span>
          <span style={{ fontSize: '12px', color: '#4A5B72', marginLeft: 'auto' }}>
            {items.length} items
          </span>
        </div>
      )}

      {/* Scrollable grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '8px',
        }}
      >
        {items.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#4A5B72',
            gap: '12px',
          }}>
            <span style={{ fontSize: '40px' }}>🔍</span>
            <span style={{ fontSize: '14px' }}>No items found</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
