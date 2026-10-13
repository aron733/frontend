import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'favicon-96.png'],
      manifest: false, // On a déjà notre manifest.json custom
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB max
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/oauth/,
          /^\/ws/,
          /robots\.txt$/,
          /sitemap\.xml$/,
          /manifest\.json$/,
          /favicon.*\.png$/,
          /apple-touch-icon.*\.png$/,
          /pwa-.*\.png$/,
          /^\/\.well-known\//,
          /registerSW\.js$/,
          /404\.html$/,
          /500\.html$/,
          /desabonnement\.html$/,
          /supprimer-compte\.html$/,
          /^\/blog\/.*\.html$/,
          /\.br$/,
          /\.gz$/,
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ]
})
