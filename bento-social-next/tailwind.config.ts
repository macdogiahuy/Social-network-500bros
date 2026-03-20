/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    darkMode: 'class',
    theme: {
      container: {
        center: true,
        screens: {
          DEFAULT: '100%',
          '3xl': '1800px',
        },
      },
    },
    screens: {
      sm: '390px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1600px',
    },
    extend: {
      fontFamily: {
        inter: ['Inter', ...fontFamily.sans],
        rubik: ['Rubik', ...fontFamily.sans],
        schibstedGrotesk: ['Schibsted Grotesk', ...fontFamily.sans],
      },
      fontSize: {
        h2: ['48px', '56px'],
        h3: ['40px', '48px'],
        h4: ['32px', '40px'],
        h5: ['24px', '28px'],
        title: ['20px', '24px'],
        base2: ['14px', '20px'],
        hairline1: ['12px', '20px'],
        caption: ['12px', '16px'],
        xxs: ['10px', '12px'],
      },
      colors: {
        cushion: 'var(--cushion)',
        avt: 'var(--avt)',
        auth: 'var(--auth)',
        primary: 'rgba(var(--primary-rgb), 0.95)',
        secondary: 'rgba(var(--primary-rgb), 0.7)',
        tertiary: 'rgba(var(--primary-rgb), 0.5)',
        surface: {
          DEFAULT: 'rgba(var(--surface-rgb), 0.7)',
          2: 'rgba(var(--surface-rgb), 0.8)',
          3: 'rgba(var(--surface-rgb), 0.9)',
          stack: 'rgba(var(--surface-stack-rgb), 0.6)',
        },
        neutral1: {
          DEFAULT: 'rgb(var(--neutral-1))',
          0: 'rgba(var(--neutral-1), 0.00)',
          1: 'rgba(var(--neutral-1), 0.01)',
          2: 'rgba(var(--neutral-1), 0.02)',
          5: 'rgba(var(--neutral-1), 0.05)',
          10: 'rgba(var(--neutral-1), 0.10)',
          15: 'rgba(var(--neutral-1), 0.15)',
          20: 'rgba(var(--neutral-1), 0.20)',
          25: 'rgba(var(--neutral-1), 0.25)',
          30: 'rgba(var(--neutral-1), 0.30)',
          35: 'rgba(var(--neutral-1), 0.35)',
          40: 'rgba(var(--neutral-1), 0.40)',
          45: 'rgba(var(--neutral-1), 0.45)',
          50: 'rgba(var(--neutral-1), 0.50)',
          55: 'rgba(var(--neutral-1), 0.55)',
          60: 'rgba(var(--neutral-1), 0.60)',
          65: 'rgba(var(--neutral-1), 0.65)',
          70: 'rgba(var(--neutral-1), 0.70)',
          75: 'rgba(var(--neutral-1), 0.75)',
          80: 'rgba(var(--neutral-1), 0.80)',
          85: 'rgba(var(--neutral-1), 0.85)',
          90: 'rgba(var(--neutral-1), 0.90)',
          95: 'rgba(var(--neutral-1), 0.95)',
        },
        neutral2: {
          DEFAULT: 'rgb(var(--neutral-2))',
          1: 'rgba(var(--neutral-2), 0.01)',
          2: 'rgba(var(--neutral-2), 0.02)',
          3: 'rgba(var(--neutral-2), 0.03)',
          5: 'rgba(var(--neutral-2), 0.05)',
          10: 'rgba(var(--neutral-2), 0.10)',
          15: 'rgba(var(--neutral-2), 0.15)',
          20: 'rgba(var(--neutral-2), 0.20)',
          25: 'rgba(var(--neutral-2), 0.25)',
          30: 'rgba(var(--neutral-2), 0.30)',
          35: 'rgba(var(--neutral-2), 0.35)',
          40: 'rgba(var(--neutral-2), 0.40)',
          45: 'rgba(var(--neutral-2), 0.45)',
          50: 'rgba(var(--neutral-2), 0.50)',
          55: 'rgba(var(--neutral-2), 0.55)',
          60: 'rgba(var(--neutral-2), 0.60)',
          65: 'rgba(var(--neutral-2), 0.65)',
          70: 'rgba(var(--neutral-2), 0.70)',
          75: 'rgba(var(--neutral-2), 0.75)',
          80: 'rgba(var(--neutral-2), 0.80)',
          85: 'rgba(var(--neutral-2), 0.85)',
          90: 'rgba(var(--neutral-2), 0.90)',
          95: 'rgba(var(--neutral-2), 0.95)',
        },
        neutral3: {
          DEFAULT: 'rgb(var(--neutral-3))',
          1: 'rgba(var(--neutral-3), 0.01)',
          5: 'rgba(var(--neutral-3), 0.05)',
          10: 'rgba(var(--neutral-3), 0.10)',
          15: 'rgba(var(--neutral-3), 0.15)',
          20: 'rgba(var(--neutral-3), 0.20)',
          25: 'rgba(var(--neutral-3), 0.25)',
          30: 'rgba(var(--neutral-3), 0.30)',
          35: 'rgba(var(--neutral-3), 0.35)',
          40: 'rgba(var(--neutral-3), 0.40)',
          45: 'rgba(var(--neutral-3), 0.45)',
          50: 'rgba(var(--neutral-3), 0.50)',
          55: 'rgba(var(--neutral-3), 0.55)',
          60: 'rgba(var(--neutral-3), 0.60)',
          65: 'rgba(var(--neutral-3), 0.65)',
          70: 'rgba(var(--neutral-3), 0.70)',
          75: 'rgba(var(--neutral-3), 0.75)',
          80: 'rgba(var(--neutral-3), 0.80)',
          85: 'rgba(var(--neutral-3), 0.85)',
          90: 'rgba(var(--neutral-3), 0.90)',
          95: 'rgba(var(--neutral-3), 0.95)',
        },
        neutral4: {
          DEFAULT: 'rgb(var(--neutral-4))',
          1: 'rgba(var(--neutral-4), 0.01)',
          5: 'rgba(var(--neutral-4), 0.05)',
          10: 'rgba(var(--neutral-4), 0.10)',
          15: 'rgba(var(--neutral-4), 0.15)',
          20: 'rgba(var(--neutral-4), 0.20)',
          25: 'rgba(var(--neutral-4), 0.25)',
          30: 'rgba(var(--neutral-4), 0.30)',
          35: 'rgba(var(--neutral-4), 0.35)',
          40: 'rgba(var(--neutral-4), 0.40)',
          45: 'rgba(var(--neutral-4), 0.45)',
          50: 'rgba(var(--neutral-4), 0.50)',
          55: 'rgba(var(--neutral-4), 0.55)',
          60: 'rgba(var(--neutral-4), 0.60)',
          65: 'rgba(var(--neutral-4), 0.65)',
          70: 'rgba(var(--neutral-4), 0.70)',
          75: 'rgba(var(--neutral-4), 0.75)',
          80: 'rgba(var(--neutral-4), 0.80)',
          85: 'rgba(var(--neutral-4), 0.85)',
          90: 'rgba(var(--neutral-4), 0.90)',
          95: 'rgba(var(--neutral-4), 0.95)',
        },
        stroke: {
          25: 'rgba(var(--neutral-1), 0.40)',
        },
        wine: '#BD3027',
        hover: '#f8f8f81a',
      },
      width: {
        '18': '72px',
        '70': '280px',
        '80': '320px',
        '85': '340px',
        '120': '480px',
      },
      letterSpacing: {
        '-2percent': '-0.02em',
        '5percent': '0.05em',
      },
      backgroundImage: {
        'linear-mask':
          'linear-gradient(180deg, rgba(var(--neutral-4), 0.20) 0%, rgba(var(--neutral-4), 0.20) 85%, rgba(var(--neutral-4), 0.00) 100%)',

        'linear-card':
          'linear-gradient(165deg, rgba(var(--neutral-1), 0.80) 0%, rgba(var(--neutral-1), 0.40) 30%, rgba(var(--neutral-1), 0) 60%, rgba(var(--neutral-1), 0.10) 100%)',
        'linear-red':
          'linear-gradient(0deg, #BD3027 0%, #BD3027 100%, rgba(var(--neutral-3), 0.70))',
        'linear-hover':
          'linear-gradient(0deg, rgba(var(--neutral-2), 0.10) 0%, rgba(var(--neutral-2), 0.10) 100%)',
        'linear-object':
          'linear-gradient(180deg, rgba(var(--neutral-2), 0.90) 0%, rgba(var(--neutral-2), 0.30) 100%)',
        auth:
          'radial-gradient(at 37% 100%, #3b3bba30 0px, transparent 50%),' +
          'radial-gradient(at 61% 100%, #623d762b 0px, transparent 50%),' +
          'radial-gradient(at 21% 0%, hsla(289,30%,47%,0.07) 0px, transparent 50%),' +
          'radial-gradient(at 45% 0%, hsla(266,100%,68%,0.1) 0px, transparent 50%),' +
          'radial-gradient(at 60% 0%, hsla(62,100%,88%,0.09) 0px, transparent 50%)',
        'auth-form':
          'linear-gradient(158deg,hsla(0,0%,100%,.06) 14.19%,hsla(0,0%,100%,0) 50.59%,hsla(0,0%,100%,0) 68.79%,hsla(0,0%,100%,.02) 105.18%)',

        modal:
          'linear-gradient(0deg, rgba(var(--neutral-2), 0.05) 0%, rgba(var(--neutral-1), 0.05) 100%),rgba(var(--neutral-3), 0.70)',
      },
      boxShadow: {
        card:
          '2px 4px 16px 0px rgba(var(--neutral-2), 0.06) inset, ' +
          '0px 24px 24px -16px rgba(5, 5, 5, 0.09), ' +
          '0px 6px 13px 0px rgba(5, 5, 5, 0.10), ' +
          '0px 6px 4px -4px rgba(5, 5, 5, 0.10), ' +
          '0px 5px 1.5px -4px rgba(5, 5, 5, 0.25)',
        button: '2px 4px 16px 0 rgba(var(--neutral-2), 0.06) inset',
        toggle:
          '0px 4px 4px 0px rgba(var(--neutral-1), 0.05) inset, 0px 8px 16px -4px rgba(var(--neutral-4), 0.20)',
        wrapper:
          '2px 4px 16px 0px rgba(var(--neutral-2), 0.06) inset,' +
          '0px 54px 32px -16px rgba(5, 5, 5, 0.05),' +
          ' 0px 24px 24px -16px rgba(5, 5, 5, 0.09),' +
          ' 0px 6px 12px 0px rgba(5, 5, 5, 0.10),' +
          ' 0px 4px 4px -4px rgba(5, 5, 5, 0.10),' +
          '0px 0.5px 1.5px -4px rgba(5, 5, 5, 0.50)',
        'auth-card':
          'inset 2px 4px 16px 0 hsla(0, 0%, 97%, .06),' +
          '0 24px 24px -16px rgba(5, 5, 5, .09),' +
          '0 6px 13px 0 rgba(5, 5, 5, .1),' +
          '0 6px 4px -4px rgba(5, 5, 5, .1),' +
          '0 5px 1.5px -4px rgba(5, 5, 5, .25)',
        dropup:
          '0px 24px 32px -12px rgba(var(--neutral-4), 0.10),' +
          '2px 4px 16px 0px rgba(var(--neutral-2), 0.06) inset',
        stack:
          '2px 4px 16px 0px rgba(var(--neutral-2), 0.06) inset,' +
          '0px 54px 32px -16px rgba(5, 5, 5, 0.05),' +
          '0px 24px 24px -16px rgba(5, 5, 5, 0.09),' +
          '0px 6px 12px 0px rgba(5, 5, 5, 0.10),' +
          '0px 4px 4px -4px rgba(5, 5, 5, 0.10),' +
          '0px 0.5px 1.5px -4px rgba(5, 5, 5, 0.50)',

        overlay:
          '2px 4px 16px 0px rgba(var(--neutral-2), 0.06) inset,' +
          '0px 54px 32px -16px rgba(5, 5, 5, 0.05),' +
          '0px 24px 24px -16px rgba(5, 5, 5, 0.09),' +
          '0px 6px 12px 0px rgba(5, 5, 5, 0.1),' +
          '0px 4px 4px -4px rgba(5, 5, 5, 0.1),' +
          '0px 0.5px 1.5px -4px rgba(5, 5, 5, 0.5)',
        'theme-box': '0px 0px 5.622px 0px rgba(var(--neutral-2), 0.25) inset',
        'theme-box2': '0px 0px 5.622px 0px rgba(var(--neutral-2), 0.25) inset',
      },
      backdropBlur: {
        50: 'blur(50px)',
        16: 'blur(16px)',
        35 :'blur(35.135135650634766px)',
      },
      zIndex: {
        999999: '999999',
        99999: '99999',
        9999: '9999',
        999: '999',
        99: '99',
        9: '9',
        1: '1',
      },
      borderRadius: {
        button: '2rem',
      },
    },
  },
  plugins: [],
};
export default config;
