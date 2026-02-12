import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主题色 - 复古哑紫（降低饱和度，增加灰调）
        primary: {
          50: '#f3f1f5',
          100: '#e4dfe8',
          200: '#cec5d6',
          300: '#b3a6c0',
          400: '#9585a8',
          500: '#7a6b91',  // 核心色：哑紫
          600: '#635878',
          700: '#524a64',
          800: '#433d52',
          900: '#382f45',
          950: '#241e2e',
        },
        // 深蓝色调 - 墨蓝（更深沉）
        mystic: {
          50: '#eceef5',
          100: '#d8dce8',
          200: '#b5bdd4',
          300: '#8e99bb',
          400: '#6b779f',
          500: '#525d85',
          600: '#434c6d',
          700: '#383f5a',
          800: '#2d3348',
          900: '#252a3b',
          950: '#171a26',
        },
        // 金色点缀 - 陈旧黄铜（降低亮度，增加暖褐）
        gold: {
          50: '#f9f6f0',
          100: '#f0e9db',
          200: '#e2d4b8',
          300: '#d1ba8f',
          400: '#c4a06a',  // 核心色：黄铜
          500: '#b8956e',
          600: '#9a7a54',
          700: '#7d6346',
          800: '#654f3a',
          900: '#523f30',
        },
        // 暗黑模式背景 - 深灰蓝（更有深度）
        dark: {
          50: '#f5f6f7',
          100: '#e8eaed',
          200: '#d1d5db',
          300: '#b0b7c3',
          400: '#8891a3',
          500: '#6b7385',
          600: '#555c6b',
          700: '#434957',
          800: '#2a2f3a',
          900: '#1a1d24',  // 核心背景色
          950: '#0d0f12',
        },
        // 新增：羊皮纸色（内容背景）
        parchment: {
          50: '#fdfcfa',
          100: '#f9f6f0',
          200: '#f3ede1',
          300: '#e8dcc4',  // 核心色
          400: '#d9c9a8',
          500: '#c7b28a',
          600: '#a8946c',
          700: '#8a7757',
          800: '#6d5d45',
          900: '#574a38',
        },
        // 新增：铁锈红（点缀警示）
        rust: {
          50: '#faf5f3',
          100: '#f2e6e1',
          200: '#e5ccc2',
          300: '#d4ab9b',
          400: '#c08671',
          500: '#a86a52',  // 核心色
          600: '#8b5543',
          700: '#6e4437',
          800: '#56372d',
          900: '#442c25',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        mystic: ['Cinzel', 'serif'],
        'mystic-zh': ['Ma Shan Zheng', 'cursive'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mystic-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
