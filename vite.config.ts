import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Daymark/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        name: 'Daymark — Local Task Manager',
        short_name: 'Daymark',
        description: 'A calm, local-first task manager that works offline.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/Daymark/',
        icons: [
          { src: '/Daymark/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/Daymark/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/Daymark/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        navigateFallback: '/Daymark/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/sync'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'daymark-sync',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: ({ request }) => ['style', 'script', 'worker', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'daymark-static',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
})
