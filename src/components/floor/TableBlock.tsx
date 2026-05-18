'use client';
import { TableData } from '@/store/useDemoStore';
import { Users } from 'lucide-react';

interface Props {
  table:   TableData;
  onClick: () => void;
}

/**
 * TableBlock — floor-plan tile for a single table.
 *
 * States: free (green) · occupied (red) · ordering (amber, pulsing).
 * Shows running total for active tables, section name as sub-label.
 */
export function TableBlock({ table, onClick }: Props) {
  const isActive = table.status !== 'free';

  return (
    <button
      onClick={onClick}
      className={`table-${table.status} relative w-full min-h-[96px] gap-0.5`}
    >
      {/* Capacity chip — top-left */}
      <div
        className="absolute top-2 left-2 flex items-center gap-0.5 opacity-60"
        style={{ fontSize: '10px' }}
      >
        <Users size={9} />
        <span className="font-medium">{table.capacity}</span>
      </div>

      {/* Status dot — top-right */}
      <div
        className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full
          ${table.status === 'free'
            ? 'bg-success shadow-[0_0_6px_rgba(34,197,94,0.7)]'
            : table.status === 'occupied'
            ? 'bg-danger shadow-[0_0_6px_rgba(239,68,68,0.7)]'
            : 'bg-warning shadow-[0_0_6px_rgba(245,158,11,0.7)]'
          }`}
      />

      {/* Table number — main content */}
      <div className="text-3xl font-black leading-none tabular-nums">{table.number}</div>

      {/* Section label */}
      <div
        className="font-semibold opacity-50 tracking-wide uppercase"
        style={{ fontSize: '9px' }}
      >
        {table.section}
      </div>

      {/* Running total OR status label */}
      <div
        className={`font-bold tabular-nums
          ${isActive && table.currentTotal ? 'opacity-90' : 'opacity-50'}`}
        style={{ fontSize: '11px' }}
      >
        {table.status === 'free'
          ? 'FREE'
          : table.currentTotal
          ? `€${table.currentTotal.toFixed(0)}`
          : table.status === 'ordering'
          ? 'ORDERING'
          : 'ACTIVE'
        }
      </div>

      {/* Opened-at time — bottom-right */}
      {table.openedAt && (
        <div
          className="absolute bottom-2 right-2.5 font-mono opacity-40"
          style={{ fontSize: '9px' }}
        >
          {table.openedAt}
        </div>
      )}
    </button>
  );
}
