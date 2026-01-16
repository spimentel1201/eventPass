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
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                neonpass: {
                    'primary': '#6366f1',        // Indigo - Acciones principales
                    'secondary': '#d946ef',      // Fuchsia - Badges VIP
                    'accent': '#06b6d4',         // Cyan - Elementos menores
                    'neutral': '#1e293b',        // Slate 800
                    'base-100': '#0f172a',       // Slate 900 - Fondo principal
                    'base-200': '#1e293b',       // Slate 800 - Tarjetas, Sidebars
                    'base-300': '#334155',       // Slate 700
                    'info': '#3b82f6',           // Blue - Asiento seleccionado
                    'success': '#22c55e',        // Green - Asiento disponible
                    'warning': '#f59e0b',        // Amber - Reservado
                    'error': '#ef4444',          // Red - Ocupado
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
