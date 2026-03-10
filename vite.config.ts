import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
          let result = html.replace(/__VITE_APP_URL__/g, appUrl)
          const gaId = env.VITE_GA_ID
          const plausibleDomain = env.VITE_PLAUSIBLE_DOMAIN
          let analyticsScript = ''
          if (gaId) {
            analyticsScript = `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');</script>`
          } else if (plausibleDomain) {
            analyticsScript = `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.js"></script>`
          }
          result = result.replace('__VITE_ANALYTICS_SCRIPT__', analyticsScript)
          return result
        },
      },
      {
        name: 'generate-sitemap',
        closeBundle() {
          const baseUrl = appUrl || 'https://example.com'
          const url = baseUrl.replace(/\/$/, '')
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
          const outDir = join(process.cwd(), 'dist')
          writeFileSync(join(outDir, 'sitemap.xml'), sitemap.trim(), 'utf-8')
          if (appUrl) {
            const robots = `User-agent: *
Allow: /

Sitemap: ${url}/sitemap.xml
`
            writeFileSync(join(outDir, 'robots.txt'), robots.trim(), 'utf-8')
          }
        },
      },
    ],
  }
})
