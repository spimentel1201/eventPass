import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Custom NeonPass colors for non-DaisyUI usage
                neon: {
                    primary: '#6366f1',
                    secondary: '#d946ef',
                    accent: '#06b6d4',
                },
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                neonpass: {
                    'primary': '#6366f1',
                    'primary-content': '#ffffff',
                    'secondary': '#d946ef',
                    'secondary-content': '#ffffff',
                    'accent': '#06b6d4',
                    'accent-content': '#ffffff',
                    'neutral': '#1e293b',
                    'neutral-content': '#d1d5db',
                    'base-100': '#0f172a',
                    'base-200': '#1e293b',
                    'base-300': '#334155',
                    'base-content': '#e2e8f0',
                    'info': '#3b82f6',
                    'info-content': '#ffffff',
                    'success': '#22c55e',
                    'success-content': '#ffffff',
                    'warning': '#f59e0b',
                    'warning-content': '#000000',
                    'error': '#ef4444',
                    'error-content': '#ffffff',
                },
            },
        ],
        darkTheme: 'neonpass',
        base: true,
        styled: true,
        utils: true,
    },
};

export default config;
