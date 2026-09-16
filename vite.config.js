import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'splash/*.png'],
      manifest: {
        name: 'VoiceClass - Grabador y Traductor',
        short_name: 'VoiceClass',
        description: 'Graba, transcribe y traduce tus clases organizadas por asignatura',
        theme_color: '#007AFF',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net/,
            handler: 'NetworkFirst',
            options: { cacheName: 'translation-cache', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } }
          },
          {
            urlPattern: /^https:\/\/lingva\./,
            handler: 'NetworkFirst',
            options: { cacheName: 'lingva-cache', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': `${import.meta.dirname}/src` }
  },
  server: {
    host: true
  },
  build: {
    sourcemap: false
  }
})
