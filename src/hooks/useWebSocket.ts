import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useBarFlowStore } from '@/store/useBarFlowStore';
import { syncPendingOrders } from '@/lib/offline-db';

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    user, token, isOnline,
    setWsConnected, updateTableStatus, addLiveOrder,
    updateLiveOrderStatus, setOnline, setPendingSyncCount,
  } = useBarFlowStore();

  // ─── Connect ───────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!user || !token || socketRef.current?.connected) return;

    const socket = io(`${WS_URL}/barflow`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected');
      setWsConnected(true);

      // Join business room with role
      socket.emit('join:business', {
        businessId: user.businessId,
        role: user.role,
      });
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
      setWsConnected(false);
    });

    // ─── Order events ──────────────────────────────────────
    socket.on('order:created', (order: any) => {
      addLiveOrder(order);
      playOrderAlert();
    });

    socket.on('order:statusChanged', (data: any) => {
      updateLiveOrderStatus(data.id, data.status);
    });

    // ─── Table events ──────────────────────────────────────
    socket.on('table:statusChanged', (data: any) => {
      updateTableStatus(data.id, data.status);
    });

    // ─── Sync complete ─────────────────────────────────────
    socket.on('sync:complete', (result: any) => {
      console.log('[WS] Sync complete:', result);
      setPendingSyncCount(0);
    });

    socketRef.current = socket;
  }, [user, token]);

  // ─── Disconnect ────────────────────────────────────────────
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setWsConnected(false);
  }, []);

  // ─── Online/offline detection ─────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      connect();

      // Trigger sync when back online
      if (user && token) {
        try {
          const result = await syncPendingOrders(
            user.businessId,
            token,
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
          );
          console.log('[Sync] Auto-sync complete:', result);
          setPendingSyncCount(0);
        } catch (e) {
          console.error('[Sync] Auto-sync failed:', e);
        }
      }
    };

    const handleOffline = () => {
      setOnline(false);
      setWsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, token]);

  // ─── Auto-connect ──────────────────────────────────────────
  useEffect(() => {
    if (user && token && isOnline) connect();
    return () => disconnect();
  }, [user, token, isOnline]);

  return { socket: socketRef.current };
}

// ─── Sound alert ───────────────────────────────────────────
function playOrderAlert() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio not available (e.g. SSR)
  }
}
