'use client';
import { useDemoStore } from '@/store/useDemoStore';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function StatusBar() {
  const { orders } = useDemoStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  const newOrders = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="flex items-center gap-3">
      {/* Live indicator */}
      <div className="flex items-center gap-1.5">
        <div className="online-dot" />
        <span className="text-xs text-secondary font-medium hidden sm:block">Live</span>
      </div>

      {/* New orders alert */}
      {newOrders > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-fast" />
          <span className="text-xs text-accent font-bold">{newOrders} new</span>
        </div>
      )}

      {/* Clock */}
      <div className="flex items-center gap-1.5 text-tertiary">
        <Clock size={13} />
        <span className="text-xs font-mono tabular-nums">{time}</span>
      </div>
    </div>
  );
}
