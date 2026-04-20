'use client';
import { useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const CLASSES = {
  success: 'bg-success/10 border-success/30 text-success',
  error:   'bg-danger/10  border-danger/30  text-danger',
  info:    'bg-accent/10  border-accent/30  text-accent',
};

export function Toast() {
  const { notification, clearNotification } = useDemoStore();

  if (!notification) return null;

  const Icon = ICONS[notification.type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border font-semibold text-sm
                       backdrop-blur-sm shadow-2xl ${CLASSES[notification.type]}`}>
        <Icon size={16} />
        <span>{notification.message}</span>
        <button onClick={clearNotification} className="ml-1 opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
