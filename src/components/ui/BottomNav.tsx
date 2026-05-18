'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingCart, Coffee, ChefHat, BarChart3 } from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

// All possible nav items in priority order
const ALL_NAV = [
  { href: '/',        icon: LayoutGrid,   label: 'Floor',   roles: ['Manager', 'Bar', 'Kitchen', null] },
  { href: '/order',   icon: ShoppingCart, label: 'Order',   roles: ['Manager', 'Bar',            null] },
  { href: '/bar',     icon: Coffee,       label: 'Bar',     roles: ['Manager', 'Bar',            null] },
  { href: '/kitchen', icon: ChefHat,      label: 'Kitchen', roles: ['Manager',          'Kitchen', null] },
  { href: '/manager', icon: BarChart3,    label: 'Manager', roles: ['Manager',                   null] },
] as const;

/**
 * BottomNav
 *
 * Role-aware bottom navigation.
 * - Manager: all 5 tabs
 * - Bar staff: Floor, Order, Bar (3 tabs)
 * - Kitchen staff: Floor, Kitchen (2 tabs)
 * - No staff (demo / not logged in): all tabs
 *
 * Hidden entirely when the device is in a pinned kiosk mode
 * (that's handled by the parent page, not here).
 */
export function BottomNav() {
  const pathname  = usePathname();
  const { cart, staff } = useDemoStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Filter nav items to those accessible for the current role.
  // `null` in the roles array means "shown when no one is logged in."
  const role = staff?.role ?? null;
  const nav  = ALL_NAV.filter((n) => (n.roles as ReadonlyArray<string | null>).includes(role));

  return (
    <nav className="flex items-stretch bg-surface border-t border-border pb-safe shrink-0">
      {nav.map(({ href, icon: Icon, label }) => {
        const active =
          href === '/'
            ? pathname === '/' || pathname.startsWith('/order/')
            : pathname.startsWith(href);
        const isOrder = href === '/order';

        return (
          <Link
            key={href}
            href={href}
            className={`nav-item flex-1 py-3 ${active ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon size={21} />
              {isOrder && cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-accent text-bg
                             text-[10px] font-black flex items-center justify-center leading-none"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
