import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const originalEnvKeys = new Set(Object.keys(process.env))

function loadEnvFile(fileName) {
  const filePath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) return

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (originalEnvKeys.has(key)) continue

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '')
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const host = process.env.DEEPSEEK_PROXY_HOST || '127.0.0.1'
const port = Number.parseInt(process.env.DEEPSEEK_PROXY_PORT || '8787', 10)
const apiKey = process.env.DEEPSEEK_API_KEY
const apiBaseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '')
const defaultModel = process.env.DEEPSEEK_MODEL || 'deepseek-v4-pro'
const thinkingType = process.env.DEEPSEEK_THINKING || 'disabled'
const maxTokens = Number.parseInt(process.env.DEEPSEEK_MAX_TOKENS || '1200', 10)
const temperature = Number.parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.2')
const allowedModels = new Set(
  (process.env.DEEPSEEK_ALLOWED_MODELS || 'deepseek-v4-pro,deepseek-v4-flash')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)
)

allowedModels.add(defaultModel)

function isLocalOrigin(origin) {
  if (!origin) return true

  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin

  if (isLocalOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin || '*')
  }

  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(`${JSON.stringify(payload)}\n`)
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large.'))
        request.destroy()
      }
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Request body must be valid JSON.'))
      }
    })
    request.on('error', reject)
  })
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function truncate(value, maxLength) {
  const text = normalizeText(value)
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function buildMessages(payload) {
  const locale = payload.locale === 'en' ? 'en' : 'zh'
  const question = truncate(payload.question, 1200)
  const contexts = Array.isArray(payload.contexts) ? payload.contexts.slice(0, 5) : []
  const systemPrompt = locale === 'en'
    ? [
        'You are the AwesomeNZ guide assistant.',
        'Answer using the provided guide excerpts first.',
        'Do not merely quote or concatenate the excerpts.',
        'Turn the excerpts into a concise practical answer with clear steps, required materials, caveats, and source titles when useful.',
        'Be concrete and practical. Do not invent policy details, fees, URLs, or official requirements.',
        'If the excerpts are not enough, say so clearly and suggest what the user should verify from official sources.',
        'Answer in English unless the user asks for another language.'
      ].join(' ')
    : [
        '你是 AwesomeNZ 指南助手。',
        '请优先基于提供的本站教程片段回答。',
        '不要只是复制或拼接教程片段。',
        '请把片段整理成简洁、可执行的办事说明，包含步骤、所需材料、注意事项，必要时点出来源标题。',
        '回答要具体、可操作，不要编造政策、费用、网址或官方要求。',
        '如果教程片段信息不足，请明确说明依据不足，并建议用户到官方来源确认。',
        '除非用户要求其他语言，否则用简体中文回答。'
      ].join(' ')

  const contextText = contexts.length > 0
    ? contexts.map((context, index) => {
        const title = truncate(context.title, 120)
        const heading = truncate(context.heading, 120)
        const url = truncate(context.url, 180)
        const text = truncate(context.text, 1800)

        return [
          `[${index + 1}] ${title}${heading && heading !== title ? ` / ${heading}` : ''}`,
          `URL: ${url}`,
          text
        ].join('\n')
      }).join('\n\n')
    : locale === 'en'
      ? 'No guide excerpt was matched.'
      : '没有匹配到教程片段。'

  const userPrompt = locale === 'en'
    ? `User question:\n${question}\n\nGuide excerpts:\n${contextText}`
    : `用户问题：\n${question}\n\n本站教程片段：\n${contextText}`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]
}

async function callDeepSeek(payload) {
  if (!apiKey) {
    return {
      statusCode: 500,
      body: {
        error: 'DEEPSEEK_API_KEY is not set. Run: export DEEPSEEK_API_KEY="your_key"'
      }
    }
  }

  const requestedModel = normalizeText(payload.model, defaultModel)
  if (!allowedModels.has(requestedModel)) {
    return {
      statusCode: 400,
      body: {
        error: `Unsupported model: ${requestedModel}`,
        allowedModels: Array.from(allowedModels)
      }
    }
  }

  const requestBody = {
    model: requestedModel,
    messages: buildMessages(payload),
    thinking: { type: thinkingType === 'enabled' ? 'enabled' : 'disabled' },
    max_tokens: maxTokens,
    temperature,
    stream: false
  }

  if (thinkingType === 'enabled') {
    requestBody.reasoning_effort = process.env.DEEPSEEK_REASONING_EFFORT || 'high'
  }

  const deepseekResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  const data = await deepseekResponse.json().catch(() => null)

  if (!deepseekResponse.ok) {
    return {
      statusCode: deepseekResponse.status,
      body: {
        error: data?.error?.message || data?.message || 'DeepSeek request failed.',
        details: data
      }
    }
  }

  return {
    statusCode: 200,
    body: {
      answer: data?.choices?.[0]?.message?.content || '',
      model: data?.model || requestedModel,
      usage: data?.usage || null
    }
  }
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(request, response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.method !== 'POST' || request.url !== '/chat') {
    sendJson(response, 404, { error: 'Use POST /chat.' })
    return
  }

  try {
    const payload = await readJsonBody(request)
    const result = await callDeepSeek(payload)
    sendJson(response, result.statusCode, result.body)
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Unexpected proxy error.'
    })
  }
})

server.listen(port, host, () => {
  console.log(`[deepseek-proxy] listening on http://${host}:${port}/chat`)
  console.log(`[deepseek-proxy] default model: ${defaultModel}`)
})
