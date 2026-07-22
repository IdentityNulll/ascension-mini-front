/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Single blue accent + neutral grays. Professional, not flashy.
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          soft: '#eff6ff',
          border: '#bfdbfe',
        },
        ink: {
          DEFAULT: '#1f2937', // primary text
          muted: '#6b7280', // secondary text
          faint: '#9ca3af', // tertiary
        },
        line: '#e5e7eb', // borders
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f9fafb', // row hover / zebra
          raised: '#f3f4f6', // table header
        },
        danger: '#dc2626',
        success: '#16a34a',
      },
      borderRadius: {
        // Small radii only.
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
      },
      fontFamily: {
        sans: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': '0.6875rem',
      },
      boxShadow: {
        // Subtle only.
        card: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        pop: '0 4px 16px -2px rgba(0, 0, 0, 0.10), 0 2px 6px -2px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
