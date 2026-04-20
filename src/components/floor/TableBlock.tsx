'use client';
import { TableData } from '@/store/useDemoStore';
import { Users } from 'lucide-react';

interface Props {
  table: TableData;
  onClick: () => void;
}

const STATUS_LABEL = {
  free:     'Free',
  occupied: 'Active',
  ordering: 'Ordering',
};

const STATUS_DOT = {
  free:     'bg-success',
  occupied: 'bg-danger',
  ordering: 'bg-warning',
};

export function TableBlock({ table, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`table-${table.status} relative w-full`}
    >
      {/* Status dot */}
      <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${STATUS_DOT[table.status]}`} />

      {/* Table number */}
      <div className="text-2xl font-black leading-none">{table.number}</div>

      {/* Capacity */}
      <div className="flex items-center gap-1 text-xs opacity-70">
        <Users size={11} />
        <span>{table.capacity}</span>
      </div>

      {/* Status label or total */}
      <div className="text-[10px] font-semibold opacity-60 tracking-wide">
        {table.status === 'free'
          ? STATUS_LABEL.free
          : table.currentTotal
          ? `€${table.currentTotal.toFixed(0)}`
          : STATUS_LABEL[table.status]}
      </div>

      {/* Time badge for occupied tables */}
      {table.openedAt && (
        <div className="absolute bottom-2 right-2.5 text-[9px] opacity-50 font-mono">
          {table.openedAt}
        </div>
      )}
    </button>
  );
}
