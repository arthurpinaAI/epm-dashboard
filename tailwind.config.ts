import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#f7f8fa',
        card: '#ffffff',
        hover: '#f2f3f7',
        subtle: '#edeef2',
        inset: '#f4f5f8',
        border: {
          DEFAULT: '#e4e5eb',
          light: '#ededf0',
          hover: '#d0d1d8',
        },
        text: {
          DEFAULT: '#111318',
          mid: '#555a66',
          dim: '#888d9b',
          faint: '#b4b8c4',
        },
        accent: {
          DEFAULT: '#5046e4',
          light: '#6e66ea',
        },
        status: {
          go: '#16815a',
          'go-bg': '#edf7f2',
          watch: '#a16c07',
          'watch-bg': '#fdf6e3',
          escalate: '#c05621',
          'escalate-bg': '#fdf0e8',
          critical: '#b91c3a',
          'critical-bg': '#fde8ec',
          postponed: '#71757e',
          'postponed-bg': '#f0f0f2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.04)',
        md: '0 2px 8px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.08)',
        lg: '0 8px 30px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlide: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease forwards',
        fadeSlide: 'fadeSlide 0.2s ease forwards',
      },
    },
  },
  plugins: [],
};

export default config;
