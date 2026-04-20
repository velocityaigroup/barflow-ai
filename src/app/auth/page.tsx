'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Demo auth — no real backend. Any 4-digit PIN works.
const DEMO_STAFF = [
  { name: 'Owner',   role: 'Manager', emoji: '👑', pin: '0000' },
  { name: 'Alex',    role: 'Bar',     emoji: '🍹', pin: '1234' },
  { name: 'Maria',   role: 'Kitchen', emoji: '👨‍🍳', pin: '5678' },
];

export default function AuthPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const appendDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) handleLogin(next);
  };

  const handleLogin = async (code: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief haptic delay

    const staff = DEMO_STAFF.find((s) => s.pin === code);
    if (staff || code.length === 4) {
      // Accept any 4-digit PIN in demo
      router.push('/');
    } else {
      setError(true);
      setPin('');
    }
    setLoading(false);
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-[100dvh] bg-bg flex flex-col items-center justify-center p-6">
      {/* Brand */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-xl scale-125" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 flex items-center justify-center text-4xl shadow-glow-accent">
            🍹
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-primary tracking-tight">BarFlow</h1>
          <p className="text-tertiary text-sm mt-0.5">by Velocity AI Group</p>
        </div>
      </div>

      {/* Demo quick-access cards */}
      <div className="w-full max-w-xs mb-8">
        <p className="label text-tertiary mb-3 text-center">Quick access (demo)</p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_STAFF.map((s) => (
            <button
              key={s.pin}
              onClick={() => { setPin(s.pin); handleLogin(s.pin); }}
              className="card p-3 flex flex-col items-center gap-1.5 hover:border-accent/30 active:scale-95 transition-all"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-primary text-xs font-bold">{s.name}</span>
              <span className="text-tertiary text-[10px]">{s.role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PIN display */}
      <div className="w-full max-w-xs mb-6">
        <p className="label text-tertiary mb-3 text-center">Or enter PIN manually</p>
        <div className="flex items-center justify-center gap-4">
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-150 ${
                pin.length > i
                  ? error
                    ? 'border-danger bg-danger/10'
                    : 'border-accent bg-accent/10'
                  : 'border-border bg-surface'
              }`}
            >
              {pin.length > i ? (
                <div className={`w-3.5 h-3.5 rounded-full ${error ? 'bg-danger' : 'bg-accent'}`} />
              ) : null}
            </div>
          ))}
        </div>
        {error && (
          <p className="text-danger text-xs text-center mt-2 animate-bounce-light">
            Incorrect PIN — try again
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {DIGITS.map((d, i) => {
          if (d === '') return <div key={i} />;
          const isBackspace = d === '⌫';
          const isDisabled = loading || pin.length >= 4;

          return (
            <button
              key={i}
              onClick={() => isBackspace ? handleBackspace() : appendDigit(d)}
              disabled={isDisabled && !isBackspace}
              className={`h-16 rounded-2xl font-bold text-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 ${
                isBackspace
                  ? 'bg-hover border border-border text-secondary text-base hover:text-primary hover:border-muted'
                  : 'bg-surface border border-border text-primary hover:border-accent/30 hover:bg-accent/5'
              }`}
            >
              {loading && !isBackspace && d === pin[pin.length - 1] ? (
                <div className="w-4 h-4 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
              ) : d}
            </button>
          );
        })}
      </div>

      {/* Skip for demo */}
      <button
        onClick={() => router.push('/')}
        className="mt-8 text-tertiary text-xs hover:text-secondary transition-colors"
      >
        Skip login (demo mode)
      </button>
    </div>
  );
}
