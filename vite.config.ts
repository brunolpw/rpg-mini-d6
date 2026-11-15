import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  publicDir: 'docs',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['capa.png'],
      manifest: {
        name: 'Mini-d6 RPG v2.5',
        short_name: 'Mini-d6',
        description: 'Manual de regras e criador de ficha offline para Mini-d6 RPG',
        theme_color: '#1e1b4b',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: 'capa.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,md}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],
});
