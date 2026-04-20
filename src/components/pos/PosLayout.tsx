'use client';
import React from 'react';

interface Props {
  sidebar: React.ReactNode;
  grid: React.ReactNode;
  cart: React.ReactNode;
}

/**
 * PosLayout — rock-solid 3-column POS layout
 *
 * Uses ONLY inline styles for the critical layout properties so nothing
 * can be overridden by Tailwind purging or CSS class conflicts.
 *
 *  ┌──────────────┬────────────────────────────┬──────────────┐
 *  │  Sidebar     │       Menu Grid            │  Cart Panel  │
 *  │  200px fixed │       flex: 1              │  300px fixed │
 *  │  scrollable  │       scrollable           │  scrollable  │
 *  └──────────────┴────────────────────────────┴──────────────┘
 */
export function PosLayout({ sidebar, grid, cart }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,          // critical: lets flex children shrink below content size
        minWidth: 0,
      }}
    >
      {sidebar}
      {grid}
      {cart}
    </div>
  );
}
