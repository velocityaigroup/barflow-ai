'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import { CATEGORIES, getItemsByCategory, MenuItem } from '@/data/menu';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatusBar } from '@/components/ui/StatusBar';
import { ModifierPanel } from '@/components/order/ModifierPanel';
import { PosLayout } from '@/components/pos/PosLayout';
import { CategorySidebar } from '@/components/pos/CategorySidebar';
import { MenuGrid } from '@/components/pos/MenuGrid';
import { CartPanel } from '@/components/pos/CartPanel';

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { tables, addToCart, openModifierPanel } = useDemoStore();

  const [activeCat, setActiveCat] = useState('cocktails');

  const table    = tables.find((t) => t.id === id);
  const activeCategory = CATEGORIES.find((c) => c.id === activeCat);
  const items    = useMemo(() => getItemsByCategory(activeCat), [activeCat]);

  const handleTap      = (item: MenuItem) => addToCart(item, [], '');
  const handleCustomize = (item: MenuItem) => openModifierPanel(item);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#0B0F14',
      }}
    >
      {/* ── Top header ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #1E2A3A',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #121821 0%, #0F1520 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid #1E2A3A',
              backgroundColor: '#1A2230',
              color: '#8B9BB4',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
              {table ? `Table ${table.number}` : 'New Order'}
            </div>
            {table && (
              <div style={{ fontSize: '12px', color: '#4A5B72', marginTop: '3px' }}>
                {table.section} · {table.capacity} seats
                {table.openedAt ? ` · Since ${table.openedAt}` : ''}
              </div>
            )}
          </div>
        </div>
        <StatusBar />
      </div>

      {/* ── 3-column POS layout ─────────────────────────────── */}
      <PosLayout
        sidebar={
          <CategorySidebar
            categories={CATEGORIES}
            activeId={activeCat}
            onSelect={setActiveCat}
          />
        }
        grid={
          <MenuGrid
            items={items}
            onTap={handleTap}
            onCustomize={handleCustomize}
            categoryName={activeCategory?.name}
            categoryEmoji={activeCategory?.emoji}
          />
        }
        cart={
          <CartPanel
            tableId={id}
            tableNumber={table?.number}
          />
        }
      />

      {/* ── Modifier overlay (does NOT affect layout) ───────── */}
      <ModifierPanel />

      <BottomNav />
    </div>
  );
}
