'use client';
import { useDemoStore } from '@/store/useDemoStore';
import { WifiOff, RefreshCw } from 'lucide-react';

/**
 * OfflineBanner — shown when offline or when pending orders need sync.
 *
 * Fully built on the design system. Zero inline styles.
 */
export function OfflineBanner() {
  const { isOnline, pendingSyncCount, syncOfflineOrders } = useDemoStore();

  if (isOnline && pendingSyncCount === 0) return null;

  const isReconnected = isOnline && pendingSyncCount > 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 shrink-0 border-b
        ${isReconnected
          ? 'bg-warning/8 border-warning/20'
          : 'bg-danger/8 border-danger/20'
        }`}
    >
      <div className="flex items-center gap-2">
        {isReconnected ? (
          <RefreshCw size={13} className="text-warning animate-spin" />
        ) : (
          <WifiOff size={13} className="text-danger" />
        )}
        <span
          className={`text-xs font-semibold ${isReconnected ? 'text-warning' : 'text-danger'}`}
        >
          {isReconnected
            ? `${pendingSyncCount} order${pendingSyncCount !== 1 ? 's' : ''} queued — tap to sync`
            : `Offline — ${pendingSyncCount} order${pendingSyncCount !== 1 ? 's' : ''} saved locally`
          }
        </span>
      </div>

      {isReconnected && (
        <button
          onClick={syncOfflineOrders}
          className={`
            text-xs font-bold text-warning
            bg-warning/12 border border-warning/30 hover:bg-warning/20
            px-3 py-1.5 rounded-lg transition-colors duration-150 shrink-0 whitespace-nowrap
          `}
        >
          Sync now
        </button>
      )}
    </div>
  );
}
