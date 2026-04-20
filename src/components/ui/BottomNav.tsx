'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ShoppingCart, Coffee, ChefHat, BarChart3 } from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

const NAV = [
  { href: '/',        icon: LayoutGrid,  label: 'Floor'   },
  { href: '/order',   icon: ShoppingCart,label: 'Order'   },
  { href: '/bar',     icon: Coffee,      label: 'Bar'     },
  { href: '/kitchen', icon: ChefHat,     label: 'Kitchen' },
  { href: '/manager', icon: BarChart3,   label: 'Manager' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { cart } = useDemoStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="flex items-stretch bg-surface border-t border-border pb-safe shrink-0">
      {NAV.map(({ href, icon: Icon, label }) => {
        // Match floor as root, others by prefix
        const active =
          href === '/' ? pathname === '/' || pathname.startsWith('/order/')
          : pathname.startsWith(href);
        const isOrder = href === '/order';

        return (
          <Link key={href} href={href} className={`nav-item flex-1 py-3 ${active ? 'active' : ''}`}>
            <div className="relative">
              <Icon size={21} />
              {isOrder && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-accent text-bg
                                 text-[10px] font-black flex items-center justify-center leading-none">
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
