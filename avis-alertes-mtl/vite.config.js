import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // Permet de rebuilder sans supprimer d'abord le dossier dist
    emptyOutDir: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // ── Assets statiques : précachés au premier chargement ──────────
        // Tous les fichiers JS, CSS, HTML et images produits par Vite
        // sont automatiquement ajoutés au précache Workbox.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // ── Données API : StaleWhileRevalidate ───────────────────────────
        // Retourne immédiatement la version en cache (si disponible),
        // puis rafraîchit en arrière-plan. Garantit l'accès hors-ligne.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/donnees\.montreal\.ca\/api\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-alertes',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 h
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      // Le manifest est géré dans public/manifest.webmanifest
      manifest: false,
      includeAssets: ['icons/*.png'],

      devOptions: {
        // Mettre à true pour tester le SW en mode dev
        enabled: false,
      },
    }),
  ],
})
