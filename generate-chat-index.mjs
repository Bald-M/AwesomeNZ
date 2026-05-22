import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const docsDir = path.resolve(rootDir, 'docs')
const publicDir = path.join(docsDir, 'public')
const outputFile = path.join(publicDir, 'chat-index.json')

const ignoredDirs = new Set(['.vitepress', 'public', 'node_modules'])
const maxChunkLength = 1200
const minChunkLength = 160

function walkMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.vitepress') continue
    if (ignoredDirs.has(entry.name)) continue

    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(absolutePath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath)
    }
  }

  return files
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith('---')) {
    return { frontmatter: '', body: markdown }
  }

  const end = markdown.indexOf('\n---', 3)
  if (end === -1) {
    return { frontmatter: '', body: markdown }
  }

  return {
    frontmatter: markdown.slice(3, end).trim(),
    body: markdown.slice(end + 4).trim()
  }
}

function parseFrontmatter(frontmatter) {
  const parsed = {}

  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '')
    if (value) parsed[key] = value
  }

  return parsed
}

function cleanInline(markdown) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function markdownToPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^:::\s*\w*.*$/gm, ' ')
    .replace(/^:::\s*$/gm, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '- ')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\s]*---+\s*$/gm, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getRoute(filePath) {
  const relative = path.relative(docsDir, filePath).replaceAll(path.sep, '/')
  const withoutExtension = relative.replace(/\.md$/, '')

  if (withoutExtension === 'index') return '/'
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -'/index'.length)}/`
  }

  return `/${withoutExtension}/`
}

function getLocale(filePath) {
  const relative = path.relative(docsDir, filePath).replaceAll(path.sep, '/')
  return relative.startsWith('en/') ? 'en' : 'zh'
}

function getFallbackTitle(filePath) {
  const route = getRoute(filePath)
  const parts = route.split('/').filter(Boolean)
  if (parts.length === 0) return 'Awesome NZ'

  return parts
    .filter((part) => part !== 'en')
    .map((part) => part.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' '))
    .join(' / ')
}

function stripEditFooter(body) {
  return body.replace(/\n---\s*\n\*?(最后编辑|Last updated|Last edit)[\s\S]*$/i, '').trim()
}

function extractSections(body, fallbackTitle) {
  const lines = stripEditFooter(body).split(/\r?\n/)
  const sections = []
  let title = fallbackTitle
  let current = { heading: '', level: 0, lines: [] }

  function pushCurrent() {
    const text = markdownToPlainText(current.lines.join('\n'))
    if (!text) return

    sections.push({
      heading: current.heading || title,
      level: current.level || 1,
      text
    })
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const heading = cleanInline(headingMatch[2])

      if (level === 1) {
        title = heading || title
        continue
      }

      pushCurrent()
      current = { heading, level, lines: [] }
      continue
    }

    current.lines.push(line)
  }

  pushCurrent()

  return { title, sections }
}

function splitTextIntoChunks(text) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const chunks = []
  let current = ''

  function pushCurrent() {
    const normalized = current.trim()
    if (normalized) chunks.push(normalized)
    current = ''
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChunkLength) {
      pushCurrent()

      const sentences = paragraph
        .split(/(?<=[。！？!?；;])\s*/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)

      for (const sentence of sentences) {
        if (sentence.length > maxChunkLength) {
          for (let start = 0; start < sentence.length; start += maxChunkLength) {
            chunks.push(sentence.slice(start, start + maxChunkLength))
          }
          continue
        }

        if ((current + '\n' + sentence).trim().length > maxChunkLength) {
          pushCurrent()
        }
        current = [current, sentence].filter(Boolean).join('\n')
      }

      continue
    }

    if ((current + '\n\n' + paragraph).trim().length > maxChunkLength && current.length >= minChunkLength) {
      pushCurrent()
    }

    current = [current, paragraph].filter(Boolean).join('\n\n')
  }

  pushCurrent()
  return chunks
}

function buildChunks(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { frontmatter, body } = stripFrontmatter(raw)
  const metadata = parseFrontmatter(frontmatter)
  const fallbackTitle = metadata.title || getFallbackTitle(filePath)
  const { title, sections } = extractSections(body, fallbackTitle)
  const route = getRoute(filePath)
  const locale = getLocale(filePath)
  const chunks = []

  if (metadata.description) {
    chunks.push({
      heading: locale === 'en' ? 'Overview' : '概览',
      text: metadata.description
    })
  }

  for (const section of sections) {
    for (const text of splitTextIntoChunks(section.text)) {
      chunks.push({
        heading: section.heading,
        text
      })
    }
  }

  return chunks.map((chunk, index) => ({
    id: `${route.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home'}-${index + 1}`,
    lang: locale,
    title,
    heading: chunk.heading,
    url: route,
    text: chunk.text
  }))
}

if (!fs.existsSync(docsDir)) {
  console.error(`[chat-index] docs dir not found: ${docsDir}`)
  process.exit(1)
}

fs.mkdirSync(publicDir, { recursive: true })

const markdownFiles = walkMarkdownFiles(docsDir).sort((a, b) => a.localeCompare(b))
const chunks = markdownFiles.flatMap(buildChunks)

const index = {
  generatedAt: new Date().toISOString(),
  pageCount: markdownFiles.length,
  chunkCount: chunks.length,
  chunks
}

fs.writeFileSync(outputFile, `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`[chat-index] generated: docs/public/chat-index.json (${index.pageCount} pages, ${index.chunkCount} chunks)`)
