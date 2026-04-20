import type { Config } from 'tailwindcss';

// ============================================================
// Velocity AI BarFlow — Design System Tokens
// Premium dark POS interface for high-pressure bar environments
// ============================================================

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Core surfaces ────────────────────────────────
        bg:       '#0B0F14',   // Page background
        surface:  '#121821',   // Card / panel surface
        hover:    '#1A2230',   // Hover state
        border:   '#1E2A3A',   // Subtle borders
        muted:    '#2A3A50',   // Muted backgrounds

        // ─── Text ─────────────────────────────────────────
        primary:   '#FFFFFF',
        secondary: '#8B9BB4',
        tertiary:  '#4A5B72',

        // ─── Accent (neon cyan) ───────────────────────────
        accent: {
          DEFAULT: '#00D4FF',
          dim:    '#00D4FF26',   // 15% opacity
          glow:   '#00D4FF40',   // 25% opacity
          border: '#00D4FF33',   // 20% opacity
        },

        // ─── Semantic ─────────────────────────────────────
        success: {
          DEFAULT: '#22C55E',
          dim:    '#22C55E26',
          border: '#22C55E40',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dim:    '#F59E0B26',
          border: '#F59E0B40',
        },
        danger: {
          DEFAULT: '#EF4444',
          dim:    '#EF444426',
          border: '#EF444440',
        },

        // ─── Status colors (table states) ─────────────────
        'table-free':     '#22C55E',
        'table-occupied': '#EF4444',
        'table-ordering': '#F59E0B',

        // ─── Order status ─────────────────────────────────
        'status-new':         '#00D4FF',
        'status-in-progress': '#F59E0B',
        'status-ready':       '#22C55E',
        'status-delivered':   '#8B9BB4',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'xs':   ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm':   ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '22px' }],
        'md':   ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '26px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '3xl':  ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl':  ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
      },

      fontWeight: {
        normal:    '400',
        medium:    '500',
        semibold:  '600',
        bold:      '700',
        extrabold: '800',
        black:     '900',
      },

      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
        'full': '9999px',
      },

      spacing: {
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },

      boxShadow: {
        'glow-accent':  '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-danger':  '0 0 20px rgba(239, 68, 68, 0.3)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':   '0 8px 32px rgba(0, 0, 0, 0.6)',
        'inner-top':    'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-surface': 'linear-gradient(135deg, #121821 0%, #0F1620 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      },

      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-fast':    'pulse 0.8s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'slide-up':      'slideUp 0.25s ease-out',
        'slide-down':    'slideDown 0.25s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'fade-in':       'fadeIn 0.2s ease-out',
        'scale-in':      'scaleIn 0.15s ease-out',
        'bounce-light':  'bounceLight 0.3s ease-out',
      },

      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(0,212,255,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0,212,255,0.6)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        bounceLight: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.94)' },
          '100%': { transform: 'scale(1)' },
        },
      },

      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.2, 0, 0, 1)',
      },

      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
