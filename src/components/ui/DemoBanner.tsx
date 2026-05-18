'use client';

/**
 * DemoBanner — shown when no backend is connected.
 * Informs investors / testers that they're viewing live demo data.
 * Does NOT render when NEXT_PUBLIC_API_URL is set (production / staging).
 */
export function DemoBanner() {
  const hasBackend = Boolean(process.env.NEXT_PUBLIC_API_URL);
  if (hasBackend) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold text-black"
      style={{ background: 'linear-gradient(90deg, #00D4FF 0%, #0099CC 100%)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
      DEMO MODE — Live seeded data · No real orders
    </div>
  );
}
