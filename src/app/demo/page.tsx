'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/useDemoStore';
import {
  Zap, Wifi, ShieldCheck, BarChart3, Smartphone,
  ChevronRight, Star, ArrowRight,
} from 'lucide-react';

// ── Animated counter hook ──────────────────────────────────────
function useCounter(target: number, duration = 1400, prefix = '', suffix = '') {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps  = 60;
    const step   = target / steps;
    const interval = duration / steps;
    let current  = 0;
    const timer  = setInterval(() => {
      current += step;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return `${prefix}${value.toLocaleString()}${suffix}`;
}

// ── Feature tiles ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Zap size={22} className="text-accent" />,
    title: '≤ 3 Tap Orders',
    desc: 'Staff take a full table order in under 10 seconds. No paper, no shouting.',
    bg: 'bg-accent/10 border-accent/20',
  },
  {
    icon: <Wifi size={22} className="text-warning" />,
    title: 'Offline-First',
    desc: 'Orders queue locally when WiFi drops and auto-sync the moment connection returns.',
    bg: 'bg-warning/10 border-warning/20',
  },
  {
    icon: <Smartphone size={22} className="text-success" />,
    title: 'Any Device',
    desc: 'Runs on the iPad, Android tablet, or staff phone already in your pocket.',
    bg: 'bg-success/10 border-success/20',
  },
  {
    icon: <BarChart3 size={22} className="text-purple-400" />,
    title: 'Live Analytics',
    desc: 'Revenue, top sellers, low-stock alerts — all in real time for managers.',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: <ShieldCheck size={22} className="text-pink-400" />,
    title: 'Role-Based Access',
    desc: 'Bar staff see bar orders. Kitchen sees kitchen. Managers see everything.',
    bg: 'bg-pink-400/10 border-pink-400/20',
  },
  {
    icon: <Star size={22} className="text-yellow-400" />,
    title: 'AI-Powered',
    desc: 'Predictive restocking, demand forecasting, and smart routing — built in.',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
  },
];

// ── Stat items ────────────────────────────────────────────────
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-black text-white tabular-nums leading-none">{value}</span>
      <span className="text-xs text-tertiary text-center leading-tight">{label}</span>
    </div>
  );
}

export default function DemoPage() {
  const router   = useRouter();
  const { login } = useDemoStore();
  const [starting, setStarting] = useState(false);
  const [visible,  setVisible]  = useState(false);

  // Stagger entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const revenue = useCounter(1847, 1600, '€');
  const orders  = useCounter(82,   1200);
  const tables  = useCounter(20,   1000);

  const handleStart = async () => {
    setStarting(true);
    await login('0000'); // auto-login as Owner
    router.push('/');
  };

  return (
    <div className="min-h-[100dvh] bg-bg overflow-y-auto">
      {/* ── Header gradient ──────────────────────────────────── */}
      <div
        className="relative px-6 pt-12 pb-8 text-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, transparent 100%)' }}
      >
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div
          className={`relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-lg scale-150" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 flex items-center justify-center text-3xl shadow-glow-accent">
                🍹
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">BarFlow</h1>
              <p className="text-accent text-xs font-semibold tracking-widest uppercase mt-0.5">AI</p>
            </div>
          </div>

          <p className="text-secondary text-base leading-relaxed max-w-xs mx-auto">
            The hospitality POS that works as fast as your team — online or off.
          </p>
        </div>
      </div>

      {/* ── Live stats bar ────────────────────────────────────── */}
      <div
        className={`mx-4 rounded-2xl border border-border bg-surface p-5 mb-6 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <p className="text-tertiary text-xs text-center mb-4 uppercase tracking-wider font-semibold">Live tonight — Velocity Beach Club</p>
        <div className="grid grid-cols-3 gap-4">
          <StatItem value={revenue} label="Revenue" />
          <div className="w-px bg-border self-stretch mx-auto" />
          <StatItem value={orders}  label="Orders" />
          <div className="col-span-3 h-px bg-border" />
          <div className="col-start-2">
            <StatItem value={tables} label="Tables" />
          </div>
        </div>
      </div>

      {/* ── Features grid ────────────────────────────────────── */}
      <div
        className={`px-4 mb-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className={`rounded-xl p-4 border ${f.bg} flex flex-col gap-2`}>
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center">
                {f.icon}
              </div>
              <p className="text-primary font-bold text-sm leading-snug">{f.title}</p>
              <p className="text-tertiary text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role previews ────────────────────────────────────── */}
      <div
        className={`px-4 mb-6 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <p className="text-tertiary text-xs uppercase tracking-wider font-semibold mb-3">Built for every role</p>
        <div className="space-y-2">
          {[
            { emoji: '👑', role: 'Manager', desc: 'Revenue, occupancy, alerts & analytics' },
            { emoji: '🍹', role: 'Bar Staff', desc: 'Drink orders with modifier picker' },
            { emoji: '👨‍🍳', role: 'Kitchen', desc: 'Ticket queue with display mode' },
            { emoji: '📱', role: 'Floor Staff', desc: '3-tap table ordering with offline queue' },
          ].map((r) => (
            <div key={r.role} className="card p-3 flex items-center gap-3">
              <span className="text-2xl shrink-0">{r.emoji}</span>
              <div className="min-w-0">
                <p className="text-primary font-semibold text-sm">{r.role}</p>
                <p className="text-tertiary text-xs truncate">{r.desc}</p>
              </div>
              <ChevronRight size={14} className="text-tertiary ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div
        className={`px-4 pb-10 transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full py-4 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-70"
          style={{
            background: starting
              ? 'rgba(0,212,255,0.4)'
              : 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
            boxShadow: starting ? 'none' : '0 0 40px rgba(0,212,255,0.4)',
          }}
        >
          {starting ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Starting demo…
            </>
          ) : (
            <>
              Start Demo <ArrowRight size={20} />
            </>
          )}
        </button>

        <p className="text-tertiary text-xs text-center mt-3">
          Auto-logged in as Manager · No account required
        </p>

        <div className="mt-6 text-center">
          <p className="text-tertiary text-xs">Built by</p>
          <p className="text-secondary text-sm font-bold mt-0.5">Velocity AI Group</p>
        </div>
      </div>
    </div>
  );
}
