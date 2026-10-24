import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { wedding } from './src/data/wedding.ts'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Keeps the static <head> metadata (used by link previews) in sync with the wedding config. */
function weddingMeta(media: string): Plugin {
  return {
    name: 'wedding-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%WEDDING_TITLE%', escapeHtml(wedding.site.title))
        .replaceAll('%WEDDING_DESCRIPTION%', escapeHtml(wedding.site.description))
        .replaceAll('%WEDDING_MEDIA%', media)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const media = `${(env.VITE_SUPABASE_URL ?? '').trim().replace(/\/$/, '')}/storage/v1/object/public/wedding`
  return {
    // Site is served from the domain root on Vercel.
    base: '/',
    plugins: [react(), tailwindcss(), weddingMeta(media)],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      target: 'es2022',
      // three.js lives in a lazily loaded chunk that is only fetched for the intro scene.
      chunkSizeWarningLimit: 1200,
    },
  }
})
