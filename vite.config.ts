import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { wedding } from './src/data/wedding.ts'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Keeps the static <head> metadata (used by link previews) in sync with the wedding config. */
function weddingMeta(): Plugin {
  return {
    name: 'wedding-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%WEDDING_TITLE%', escapeHtml(wedding.site.title))
        .replaceAll('%WEDDING_DESCRIPTION%', escapeHtml(wedding.site.description))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), weddingMeta()],
  build: {
    // three.js lives in a lazily loaded chunk that is only fetched for the intro scene.
    chunkSizeWarningLimit: 1200,
  },
})
