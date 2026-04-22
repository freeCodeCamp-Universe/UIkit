// Tailwind preset mirroring freeCodeCamp UIKit design tokens.
// Every entry maps to a CSS custom property declared in
// @freecodecamp/uikit-css/tokens.css — the preset is a typed alias
// layer, not a parallel source of truth. Import this preset and
// tokens.css together to get identical visual output.
import type { Config } from 'tailwindcss';

const fontSans: string[] = [
  'Lato',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'sans-serif'
];

const fontMono: string[] = [
  'Hack-ZeroSlash',
  'Fira Mono',
  'Menlo',
  'Consolas',
  'monospace'
];

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        fg: {
          primary: 'var(--foreground-primary)',
          secondary: 'var(--foreground-secondary)',
          tertiary: 'var(--foreground-tertiary)',
          quaternary: 'var(--foreground-quaternary)',
          muted: 'var(--foreground-muted)'
        },
        bg: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
          quaternary: 'var(--background-quaternary)'
        },
        highlight: {
          color: 'var(--highlight-color)',
          background: 'var(--highlight-background)'
        },
        success: {
          color: 'var(--success-color)',
          background: 'var(--success-background)'
        },
        danger: {
          color: 'var(--danger-color)',
          background: 'var(--danger-background)'
        },
        warning: {
          color: 'var(--warning-color)',
          background: 'var(--warning-background)'
        },
        purple: {
          color: 'var(--purple-color)',
          background: 'var(--purple-background)'
        },
        love: {
          color: 'var(--love-color)'
        },
        cta: {
          background: 'var(--cta-background)',
          foreground: 'var(--cta-foreground)'
        }
      },
      fontFamily: {
        sans: fontSans,
        mono: fontMono
      },
      fontSize: {
        sm: 'var(--fs-sm)',
        md: 'var(--fs-md)',
        lg: 'var(--fs-lg)',
        xl: 'var(--fs-xl)',
        '2xl': 'var(--fs-2xl)',
        '3xl': 'var(--fs-3xl)'
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)'
      },
      borderWidth: {
        hair: 'var(--border-width-hair)',
        DEFAULT: 'var(--border-width-default)',
        thick: 'var(--border-width-thick)'
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)'
      },
      transitionTimingFunction: {
        snap: 'var(--ease-snap)',
        out: 'var(--ease-out)'
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)'
      },
      zIndex: {
        breadcrumbs: 'var(--z-breadcrumbs)',
        flash: 'var(--z-flash)',
        siteHeader: 'var(--z-site-header)',
        modal: 'var(--z-modal)'
      }
    }
  }
};

export default preset;
