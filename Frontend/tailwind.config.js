/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00687b', // Primary deep teal/cyan
          light: '#04aac9',   // Vibrant cyan from description
          container: '#04aac9',
          'on-container': '#003945',
          fixed: '#afecff',
          'fixed-dim': '#57d6f6',
        },
        secondary: {
          DEFAULT: '#00687c', // Action secondary deeper teal
          light: '#2e8196',   // From text description
          container: '#99e5fd',
        },
        tertiary: {
          DEFAULT: '#475d91', // Muted slate-blue
          light: '#6076ac',   // From text description
          container: '#859bd3',
        },
        surface: {
          DEFAULT: '#faf9ff',
          dim: '#d7d9e6',
          bright: '#faf9ff',
          lowest: '#ffffff',
          low: '#f1f3ff',
          container: '#ebedfa',
          high: '#e5e7f4',
          highest: '#e0e2ee',
          variant: '#e0e2ee',
          bg: '#f6fbfe', // Custom light surface background from description
        },
        'on-surface': '#181b24',
        'on-surface-variant': '#3d494d',
        'inverse-surface': '#2d303a',
        'inverse-on-surface': '#eef0fd',
        outline: '#6d797d',
        'outline-variant': '#bcc9cd',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        }
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        'gutter': '24px',
        'margin-desktop': '40px',
        'margin-mobile': '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      }
    },
  },
  plugins: [],
}

