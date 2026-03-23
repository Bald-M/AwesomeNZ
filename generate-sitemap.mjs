import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'docs/.vitepress/dist')
const siteUrl = (process.env.SITE_URL ?? 'https://www.awesome-nz.com').replace(/\/+$/, '')
const basePath = (process.env.BASE_PATH ?? '/').replace(/\/+$/, '') || ''

function toUrlPath(filePath) {
  // filePath: absolute path within dist
  const rel = path.relative(distDir, filePath).replaceAll(path.sep, '/')
  if (!rel) return '/'

  // Only treat index.html as "directory" URLs for nicer search engine URLs.
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) {
    const dir = rel.slice(0, -'/index.html'.length)
    return `/${dir}/`
  }

  if (rel.endsWith('.html')) return `/${rel.slice(0, -'.html'.length)}`
  return `/${rel}`
}

function formatDate(date) {
  const d = new Date(date)
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10)
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(abs))
    else files.push(abs)
  }
  return files
}

if (!fs.existsSync(distDir)) {
  console.error(`[sitemap] dist dir not found: ${distDir}`)
  process.exit(1)
}

const allFiles = walk(distDir)
const htmlFiles = allFiles.filter((p) => p.endsWith('.html'))

// Exclude error pages and any other non-content HTML.
const urlPaths = new Set()
for (const filePath of htmlFiles) {
  const rel = path.relative(distDir, filePath).replaceAll(path.sep, '/')
  if (rel === '404.html') continue
  urlPaths.add(toUrlPath(filePath))
}

const urls = Array.from(urlPaths).sort((a, b) => a.localeCompare(b))

const urlsetXml = urls
  .map((u) => {
    // Map url path back to dist file for lastmod.
    // For directory urls, we stored as `/dir/` and it should correspond to `dir/index.html`.
    const normalized = u === '/' ? '' : u.replace(/^\/+|\/+$/g, '')
    let fileCandidate = ''
    if (u === '/') {
      fileCandidate = path.join(distDir, 'index.html')
    } else if (u.endsWith('/')) {
      fileCandidate = path.join(distDir, normalized, 'index.html')
    } else {
      fileCandidate = path.join(distDir, `${normalized}.html`)
    }

    let lastmod = formatDate(Date.now())
    try {
      if (fs.existsSync(fileCandidate)) {
        lastmod = formatDate(fs.statSync(fileCandidate).mtime)
      }
    } catch {
      // ignore lastmod errors
    }

    const loc = `${siteUrl}${basePath ? basePath : ''}${u}`
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
  })
  .join('\n')

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${urlsetXml}\n` +
  `</urlset>\n`

const robotsTxt =
  `User-agent: *\n` +
  `Allow: /${basePath ? '' : ''}\n` +
  `Sitemap: ${siteUrl}${basePath ? basePath : ''}/sitemap.xml\n`

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8')
fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8')

console.log(`[sitemap] generated: sitemap.xml + robots.txt (${urls.length} urls)`)

