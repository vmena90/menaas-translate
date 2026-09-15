/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#283044", "primary-fixed": "#e1e0ff", "on-error-container": "#ffdad6", "inverse-surface": "#dae2fd", "primary-container": "#8083ff", "tertiary-container": "#8582ff", "on-surface": "#dae2fd", "secondary-fixed-dim": "#4cd7f6", "surface-tint": "#c0c1ff", "tertiary-fixed": "#e2dfff", "on-tertiary-fixed-variant": "#3323cc", "on-tertiary-fixed": "#0f0069", "surface-variant": "#2d3449", "secondary": "#4cd7f6", "surface": "#0b1326", "surface-container": "#171f33", "error": "#ffb4ab", "on-secondary-fixed": "#001f26", "on-surface-variant": "#c7c4d7", "tertiary": "#c3c0ff", "on-tertiary-container": "#180092", "surface-container-low": "#131b2e", "outline-variant": "#464554", "on-primary-fixed": "#07006c", "background": "#0b1326", "secondary-fixed": "#acedff", "surface-bright": "#31394d", "on-secondary-container": "#00424e", "surface-container-high": "#222a3d", "inverse-primary": "#494bd6", "on-secondary": "#003640", "surface-container-highest": "#2d3449", "on-error": "#690005", "surface-dim": "#0b1326", "outline": "#908fa0", "on-background": "#dae2fd", "on-tertiary": "#1d00a5", "on-secondary-fixed-variant": "#004e5c", "primary": "#c0c1ff", "error-container": "#93000a", "secondary-container": "#03b5d3", "surface-container-lowest": "#060e20", "tertiary-fixed-dim": "#c3c0ff", "on-primary-fixed-variant": "#2f2ebe", "primary-fixed-dim": "#c0c1ff", "on-primary": "#1000a9", "on-primary-container": "#0d0096"
      },
      borderRadius: {
        "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem", "space-sm": "0.5rem", "space-xl": "2rem", "gutter-mobile": "0.5rem", "gutter": "0.75rem", "margin-mobile": "1rem", "space-lg": "1.25rem", "margin": "1.25rem", "space-md": "0.875rem"
      },
      fontFamily: {
        "caption": ["Inter", "sans-serif"], 
        "body-lg": ["Inter", "sans-serif"], 
        "display-xl-mobile": ["Inter", "sans-serif"], 
        "body-md": ["Inter", "sans-serif"], 
        "label-mono-lg": ["JetBrains Mono", "monospace"], 
        "headline-md": ["Inter", "sans-serif"], 
        "headline-lg": ["Inter", "sans-serif"], 
        "label-mono-sm": ["JetBrains Mono", "monospace"], 
        "headline-sm": ["Inter", "sans-serif"], 
        "display-xl": ["Inter", "sans-serif"], 
        "body-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "caption": ["11px", { "lineHeight": "14px", "letterSpacing": "0.03em", "fontWeight": "500" }], 
        "body-lg": ["17px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "400" }], 
        "display-xl-mobile": ["34px", { "lineHeight": "40px", "letterSpacing": "-0.025em", "fontWeight": "700" }], 
        "body-md": ["15px", { "lineHeight": "22px", "letterSpacing": "-0.005em", "fontWeight": "400" }], 
        "label-mono-lg": ["16px", { "lineHeight": "20px", "letterSpacing": "-0.02em", "fontWeight": "500" }], 
        "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }], 
        "headline-lg": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "600" }], 
        "label-mono-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }], 
        "headline-sm": ["18px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "600" }], 
        "display-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.03em", "fontWeight": "700" }], 
        "body-sm": ["13px", { "lineHeight": "18px", "letterSpacing": "0em", "fontWeight": "400" }]
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
