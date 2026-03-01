import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.BASE_URL || '/'
  const appUrl = env.VITE_APP_URL || ''

  return {
    base,
    plugins: [
      react(),
      {
        name: 'inject-app-url',
        transformIndexHtml(html) {
          return html.replace(/__VITE_APP_URL__/g, appUrl)
        },
      },
    ],
  }
})
