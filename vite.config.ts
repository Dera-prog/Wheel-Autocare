import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/logo.png', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-maskable.png'],
      manifest: {
        name: 'WheelWell AutoCare',
        short_name: 'WheelWell',
        description: 'Never miss a service or renewal. Your vehicle papers, always in your pocket.',
        theme_color: '#4A25F5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webp}'],
        navigateFallback: '/index.html'
      }
    })
  ],
  server: { port: 5183, host: true }
})
