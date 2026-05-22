<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'

type LocaleKey = 'zh' | 'en'
type ChatModel = 'deepseek-v4-pro' | 'deepseek-v4-flash'

type ChatChunk = {
  id: string
  lang: LocaleKey
  title: string
  heading: string
  url: string
  text: string
}

type ChatIndex = {
  generatedAt: string
  pageCount: number
  chunkCount: number
  chunks: ChatChunk[]
}

type ScoredChunk = ChatChunk & {
  score: number
  snippet: string
}

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
  sources?: ScoredChunk[]
}

type RemoteAnswer = {
  answer: string | null
  error?: string
}

type DeepSeekMessage = {
  role: 'system' | 'user'
  content: string
}

const { lang } = useData()

const locale = computed<LocaleKey>(() => (lang.value === 'en' ? 'en' : 'zh'))

const content = computed(() => {
  if (locale.value === 'en') {
    return {
      title: 'AwesomeNZ Assistant',
      subtitle: 'Searches this guide first',
      launcherLabel: 'Open AwesomeNZ assistant',
      closeLabel: 'Close assistant',
      resetLabel: 'Start a new chat',
      placeholder: 'Ask about visas, bank statements, GP visits...',
      send: 'Send',
      loading: 'Loading the guide index...',
      indexError: 'The guide index is not available yet. Try rebuilding the site, then refresh this page.',
      welcome: 'Hi, I can search the AwesomeNZ guides and point you to the relevant steps, materials, and notes. Try asking: what do I need for a student visa?',
      noMatch: 'I could not find a strong match in the current guide index. Try using keywords from the guide, such as “student visa”, “bank statement”, “GP”, or “police certificate”.',
      localPrefix: 'I found these relevant notes in the guide:',
      localSuffix: 'Open the sources below for the full walkthrough and screenshots.',
      sourceTitle: 'Sources',
      modelLabel: 'Choose DeepSeek model',
      remoteErrorPrefix: 'DeepSeek did not answer successfully: ',
      remoteHelp: 'I am showing the local guide search fallback below. Check the API key, model access, account balance, and whether the browser request to DeepSeek is allowed.',
      remoteMissingHelp: 'I am showing the local guide search fallback below. This build does not include VITE_DEEPSEEK_API_KEY. Add DEEPSEEK_API_KEY in GitHub Secrets and redeploy, or set VITE_DEEPSEEK_API_KEY locally.',
      remoteMissing: 'The DeepSeek API key is not configured.',
      remoteEmpty: 'The DeepSeek response did not include an answer.',
      fallbackNotice: 'This is not a DeepSeek answer. It is the local guide-search fallback.'
    }
  }

  return {
    title: 'AwesomeNZ 助手',
    subtitle: '优先检索本站教程',
    launcherLabel: '打开 AwesomeNZ 助手',
    closeLabel: '关闭助手',
    resetLabel: '开启新对话',
    placeholder: '问签证、银行流水、GP、无犯罪证明...',
    send: '发送',
    loading: '正在加载教程索引...',
    indexError: '教程索引暂时不可用。请重新构建站点后刷新页面。',
    welcome: '你好，我可以按 AwesomeNZ 教程帮你找办理步骤、材料清单和注意事项。可以试着问：学生签证需要准备什么材料？',
    noMatch: '我在当前教程索引里没有找到足够匹配的内容。可以换成教程里的关键词试试，比如“学生签证”“银行流水”“GP”“无犯罪记录”。',
    localPrefix: '我在教程里找到了这些相关信息：',
    localSuffix: '建议点开下方来源查看完整步骤和截图。',
    sourceTitle: '来源',
    modelLabel: '选择 DeepSeek 模型',
    remoteErrorPrefix: 'DeepSeek 没有成功回答：',
    remoteHelp: '下面先显示本地教程检索兜底结果。请检查 API Key、模型权限、账户余额，以及浏览器是否允许直接请求 DeepSeek。',
    remoteMissingHelp: '下面先显示本地教程检索兜底结果。当前构建没有包含 VITE_DEEPSEEK_API_KEY；请在 GitHub Secrets 添加 DEEPSEEK_API_KEY 后重新部署，或本地设置 VITE_DEEPSEEK_API_KEY。',
    remoteMissing: 'DeepSeek API Key 没有配置。',
    remoteEmpty: 'DeepSeek 返回里没有可显示的回答。',
    fallbackNotice: '注意：这不是 DeepSeek 回答，而是本地检索兜底。'
  }
})

const modelOptions: Array<{ label: string; value: ChatModel }> = [
  { label: 'V4 Pro', value: 'deepseek-v4-pro' },
  { label: 'V4 Flash', value: 'deepseek-v4-flash' }
]

const isOpen = ref(false)
const isLoadingIndex = ref(false)
const isThinking = ref(false)
const indexError = ref('')
const question = ref('')
const selectedModel = ref<ChatModel>('deepseek-v4-pro')
const chatIndex = ref<ChatIndex | null>(null)
const messages = ref<ChatMessage[]>([])
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

let messageCounter = 0

const canSend = computed(() => question.value.trim().length > 0 && !isThinking.value && !isLoadingIndex.value)
const deepSeekApiKey = computed(() => String(import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim())
const deepSeekApiBaseUrl = computed(() => String(import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim().replace(/\/+$/, ''))
const deepSeekMaxTokens = computed(() => {
  const value = Number.parseInt(String(import.meta.env.VITE_DEEPSEEK_MAX_TOKENS || '1200'), 10)
  return Number.isFinite(value) && value > 0 ? value : 1200
})
const deepSeekTemperature = computed(() => {
  const value = Number.parseFloat(String(import.meta.env.VITE_DEEPSEEK_TEMPERATURE || '0.2'))
  return Number.isFinite(value) ? value : 0.2
})

function truncate(value: string, maxLength: number) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function getRemoteHelp() {
  return deepSeekApiKey.value ? content.value.remoteHelp : content.value.remoteMissingHelp
}

function getFallbackNotice() {
  return content.value.fallbackNotice
}

function nextMessageId() {
  messageCounter += 1
  return `chat-message-${messageCounter}`
}

function resetChat() {
  messages.value = [
    {
      id: nextMessageId(),
      role: 'assistant',
      content: content.value.welcome
    }
  ]
}

function openChat() {
  isOpen.value = true
  nextTick(() => {
    inputEl.value?.focus()
    scrollToBottom()
  })
}

function closeChat() {
  isOpen.value = false
}

function scrollToBottom() {
  if (!messagesEl.value) return
  messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  const normalized = normalizeSearchText(value)
  const tokens = new Set<string>()
  const stopChars = new Set('的一是在了和与或及啊吗呢吧把被给到去就都也还很更可可否请问怎么怎样如何哪些什么需要准备办理申请新西兰'.split(''))

  for (const match of normalized.matchAll(/[\u4e00-\u9fff]+|[a-z0-9]+/g)) {
    const segment = match[0]

    if (/^[a-z0-9]+$/.test(segment)) {
      if (segment.length > 1) tokens.add(segment)
      continue
    }

    if (segment.length > 1) tokens.add(segment)

    for (const char of Array.from(segment)) {
      if (!stopChars.has(char)) tokens.add(char)
    }

    for (let index = 0; index < segment.length - 1; index += 1) {
      tokens.add(segment.slice(index, index + 2))
    }

    for (let index = 0; index < segment.length - 2; index += 1) {
      tokens.add(segment.slice(index, index + 3))
    }
  }

  return Array.from(tokens).filter((token) => token.length > 0)
}

function countOccurrences(text: string, token: string) {
  if (!token) return 0

  let count = 0
  let position = text.indexOf(token)
  while (position !== -1 && count < 8) {
    count += 1
    position = text.indexOf(token, position + token.length)
  }

  return count
}

function scoreChunk(chunk: ChatChunk, query: string, tokens: string[]) {
  const normalizedQuery = normalizeSearchText(query)
  const normalizedTitle = normalizeSearchText(chunk.title)
  const normalizedHeading = normalizeSearchText(chunk.heading)
  const normalizedText = normalizeSearchText(chunk.text)
  const combined = `${normalizedTitle} ${normalizedHeading} ${normalizedText}`
  const intentTerms = [
    '材料',
    '材料准备',
    '准备',
    '清单',
    '流程',
    '步骤',
    '费用',
    '价格',
    '时间',
    '地址',
    '电话',
    '入口',
    '登录',
    '注意',
    '有效期',
    '报销',
    '体检',
    '银行流水',
    '无犯罪',
    'materials',
    'prepare',
    'documents',
    'fees',
    'cost',
    'time',
    'address',
    'login',
    'steps',
    'process',
    'notes',
    'validity',
    'reimbursement',
    'medical',
    'bank statement',
    'police certificate'
  ]

  let score = 0

  if (normalizedQuery.length > 1 && combined.includes(normalizedQuery)) {
    score += 18
  }

  for (const term of intentTerms) {
    if (!normalizedQuery.includes(term)) continue
    if (normalizedHeading.includes(term)) score += 34
    if (normalizedTitle.includes(term)) score += 6
    if (normalizedText.includes(term)) score += 5
  }

  for (const token of tokens) {
    const weight = token.length >= 3 ? 2.4 : token.length === 2 ? 1.6 : 0.35
    if (normalizedTitle.includes(token)) score += weight * 4
    if (normalizedHeading.includes(token)) score += weight * 3
    score += Math.min(countOccurrences(normalizedText, token), 6) * weight
  }

  return score
}

function buildSnippet(chunk: ChatChunk, tokens: string[]) {
  const normalizedHeading = normalizeSearchText(chunk.heading)
  const intentHeadingTokens = [
    '材料',
    '准备',
    '清单',
    '流程',
    '步骤',
    '费用',
    '时间',
    '地址',
    '入口',
    '登录',
    '注意',
    '报销',
    'materials',
    'documents',
    'process',
    'steps',
    'fees',
    'time',
    'address',
    'login',
    'notes'
  ]
  const headingMatchesIntent = intentHeadingTokens.some((token) => normalizedHeading.includes(token) && tokens.includes(token))

  if (headingMatchesIntent) {
    const compact = chunk.text
      .replace(/\s+/g, ' ')
      .replace(/^材料\s+说明\s+/i, '')
      .replace(/^material\s+description\s+/i, '')
      .trim()

    return compact.length > 220 ? `${compact.slice(0, 220)}...` : compact
  }

  const candidates = chunk.text
    .split(/[\n。！？!?；;]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12)

  const ranked = candidates
    .map((candidate) => {
      const normalized = normalizeSearchText(candidate)
      const score = tokens.reduce((sum, token) => sum + (normalized.includes(token) ? token.length : 0), 0)
      return { candidate, score }
    })
    .sort((a, b) => b.score - a.score)

  const selected = ranked[0]?.candidate || candidates[0] || chunk.text
  return selected.length > 180 ? `${selected.slice(0, 180)}...` : selected
}

function findMatches(query: string) {
  if (!chatIndex.value) return []

  const tokens = tokenize(query)
  const localeChunks = chatIndex.value.chunks.filter((chunk) => chunk.lang === locale.value)
  const chunks = localeChunks.length > 0 ? localeChunks : chatIndex.value.chunks

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, query, tokens),
      snippet: buildSnippet(chunk, tokens)
    }))
    .filter((chunk) => chunk.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

function buildLocalAnswer(matches: ScoredChunk[]) {
  if (indexError.value) return content.value.indexError
  if (matches.length === 0) return content.value.noMatch

  const lines = matches.slice(0, 3).map((match) => {
    const heading = match.heading && match.heading !== match.title ? ` / ${match.heading}` : ''
    return `- ${match.title}${heading}：${match.snippet}`
  })

  return `${content.value.localPrefix}\n\n${lines.join('\n')}\n\n${content.value.localSuffix}\n\n${getFallbackNotice()}`
}

function buildDeepSeekMessages(query: string, matches: ScoredChunk[]): DeepSeekMessage[] {
  const systemPrompt = locale.value === 'en'
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

  const contextText = matches.length > 0
    ? matches.slice(0, 5).map((match, index) => {
        const title = truncate(match.title, 120)
        const heading = truncate(match.heading, 120)
        const url = truncate(match.url, 180)
        const text = truncate(match.text, 1800)

        return [
          `[${index + 1}] ${title}${heading && heading !== title ? ` / ${heading}` : ''}`,
          `URL: ${url}`,
          text
        ].join('\n')
      }).join('\n\n')
    : locale.value === 'en'
      ? 'No guide excerpt was matched.'
      : '没有匹配到教程片段。'

  const userPrompt = locale.value === 'en'
    ? `User question:\n${truncate(query, 1200)}\n\nGuide excerpts:\n${contextText}`
    : `用户问题：\n${truncate(query, 1200)}\n\n本站教程片段：\n${contextText}`

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]
}

async function requestRemoteAnswer(query: string, matches: ScoredChunk[]): Promise<RemoteAnswer> {
  const apiKey = deepSeekApiKey.value
  if (!apiKey) return { answer: null, error: content.value.remoteMissing }

  try {
    const response = await fetch(`${deepSeekApiBaseUrl.value}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel.value,
        messages: buildDeepSeekMessages(query, matches),
        thinking: { type: 'disabled' },
        max_tokens: deepSeekMaxTokens.value,
        temperature: deepSeekTemperature.value,
        stream: false
      })
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const message = data?.error?.message || data?.error || data?.message || `HTTP ${response.status}`
      return { answer: null, error: message }
    }

    const answer = data?.choices?.[0]?.message?.content
    if (typeof answer === 'string' && answer.trim()) return { answer }

    return { answer: null, error: content.value.remoteEmpty }
  } catch (error) {
    console.warn('[AwesomeNZ chat] remote answer failed, using local search fallback.', error)
    return {
      answer: null,
      error: error instanceof Error ? error.message : 'Network request failed.'
    }
  }
}

function buildAnswer(matches: ScoredChunk[], remoteAnswer: RemoteAnswer) {
  if (remoteAnswer.answer) return remoteAnswer.answer

  const localAnswer = buildLocalAnswer(matches)
  return `${content.value.remoteErrorPrefix}${remoteAnswer.error || content.value.remoteEmpty}\n\n${getRemoteHelp()}\n\n${localAnswer}`
}

async function sendQuestion() {
  const text = question.value.trim()
  if (!text || isThinking.value) return

  messages.value.push({
    id: nextMessageId(),
    role: 'user',
    content: text
  })
  question.value = ''
  isThinking.value = true
  await nextTick(scrollToBottom)

  const matches = findMatches(text)
  const remoteAnswer = await requestRemoteAnswer(text, matches)

  messages.value.push({
    id: nextMessageId(),
    role: 'assistant',
    content: buildAnswer(matches, remoteAnswer),
    sources: matches.slice(0, 3)
  })

  isThinking.value = false
  await nextTick(scrollToBottom)
}

watch(locale, resetChat, { immediate: true })

onMounted(async () => {
  isLoadingIndex.value = true
  indexError.value = ''

  try {
    const response = await fetch(withBase('/chat-index.json'), { cache: 'force-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    chatIndex.value = await response.json()
  } catch (error) {
    console.warn('[AwesomeNZ chat] guide index failed to load.', error)
    indexError.value = content.value.indexError
  } finally {
    isLoadingIndex.value = false
  }
})
</script>

<template>
  <div class="anz-chatbot" :class="{ 'is-open': isOpen }">
    <button
      v-if="!isOpen"
      class="anz-chatbot__launcher"
      type="button"
      :aria-label="content.launcherLabel"
      :title="content.launcherLabel"
      @click="openChat"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" class="anz-chatbot__launcher-icon">
        <path d="M4.5 13.5v-2a7.5 7.5 0 0 1 15 0v2" />
        <path d="M6.5 17.5h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1v5Z" />
        <path d="M17.5 17.5h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-1v5Z" />
        <path d="M8.5 18.5a5.5 5.5 0 0 0 7 0" />
        <path d="M15.5 18.5h1.2a2.8 2.8 0 0 0 2.8-2.8" />
      </svg>
    </button>

    <section v-else class="anz-chatbot__panel" role="dialog" :aria-label="content.title">
      <header class="anz-chatbot__header">
        <div class="anz-chatbot__heading">
          <p class="anz-chatbot__title">{{ content.title }}</p>
          <p class="anz-chatbot__subtitle">{{ content.subtitle }}</p>
        </div>
        <div class="anz-chatbot__tools">
          <select
            v-model="selectedModel"
            class="anz-chatbot__model-select"
            :aria-label="content.modelLabel"
            :title="content.modelLabel"
          >
            <option
              v-for="option in modelOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <div class="anz-chatbot__actions">
            <button type="button" :aria-label="content.resetLabel" :title="content.resetLabel" @click="resetChat">↻</button>
            <button type="button" :aria-label="content.closeLabel" :title="content.closeLabel" @click="closeChat">×</button>
          </div>
        </div>
      </header>

      <p v-if="isLoadingIndex || indexError" class="anz-chatbot__status">
        {{ isLoadingIndex ? content.loading : indexError }}
      </p>

      <div ref="messagesEl" class="anz-chatbot__messages">
        <article
          v-for="message in messages"
          :key="message.id"
          class="anz-chatbot__message"
          :class="`is-${message.role}`"
        >
          <div class="anz-chatbot__bubble">{{ message.content }}</div>
          <div v-if="message.sources?.length" class="anz-chatbot__sources">
            <p>{{ content.sourceTitle }}</p>
            <a
              v-for="source in message.sources"
              :key="source.id"
              :href="withBase(source.url)"
            >
              {{ source.title }}<span v-if="source.heading && source.heading !== source.title"> · {{ source.heading }}</span>
            </a>
          </div>
        </article>

        <article v-if="isThinking" class="anz-chatbot__message is-assistant">
          <div class="anz-chatbot__bubble anz-chatbot__thinking">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </article>
      </div>

      <form class="anz-chatbot__form" @submit.prevent="sendQuestion">
        <textarea
          ref="inputEl"
          v-model="question"
          rows="2"
          :placeholder="content.placeholder"
          @keydown.enter.exact.prevent="sendQuestion"
        ></textarea>
        <button type="submit" :disabled="!canSend">{{ content.send }}</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.anz-chatbot {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
  font-family: var(--vp-font-family-base);
}

.anz-chatbot__launcher {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid var(--vp-c-brand-2);
  border-radius: 999px;
  background: var(--vp-c-brand-3);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22);
  color: var(--vp-c-white);
  cursor: pointer;
  line-height: 1;
}

.anz-chatbot__launcher:hover {
  background: var(--vp-c-brand-2);
}

.anz-chatbot__launcher-icon {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.anz-chatbot__panel {
  display: flex;
  width: min(390px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 40px));
  overflow: hidden;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.26);
}

.anz-chatbot__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.anz-chatbot__heading {
  min-width: 0;
}

.anz-chatbot__title,
.anz-chatbot__subtitle,
.anz-chatbot__status,
.anz-chatbot__sources p {
  margin: 0;
}

.anz-chatbot__title {
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.anz-chatbot__subtitle {
  margin-top: 2px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
}

.anz-chatbot__tools {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.anz-chatbot__model-select {
  width: 92px;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 7px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1;
}

.anz-chatbot__model-select:focus {
  border-color: var(--vp-c-brand-2);
  outline: none;
}

.anz-chatbot__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
}

.anz-chatbot__actions button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
}

.anz-chatbot__actions button:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.anz-chatbot__status {
  padding: 9px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.5;
}

.anz-chatbot__messages {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 14px;
  background: var(--vp-c-bg);
}

.anz-chatbot__message {
  display: flex;
  max-width: 100%;
  flex-direction: column;
  gap: 7px;
}

.anz-chatbot__message.is-user {
  align-items: flex-end;
}

.anz-chatbot__message.is-assistant {
  align-items: flex-start;
}

.anz-chatbot__bubble {
  max-width: 100%;
  border-radius: 8px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.65;
}

.is-assistant .anz-chatbot__bubble {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.is-user .anz-chatbot__bubble {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

.anz-chatbot__sources {
  display: grid;
  width: 100%;
  gap: 5px;
  border-left: 3px solid var(--vp-c-brand-soft);
  padding-left: 9px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.45;
}

.anz-chatbot__sources p {
  font-weight: 700;
}

.anz-chatbot__sources a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.anz-chatbot__sources a:hover {
  text-decoration: underline;
}

.anz-chatbot__thinking {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 54px;
}

.anz-chatbot__thinking span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  animation: anz-chatbot-pulse 1s infinite ease-in-out;
  background: var(--vp-c-text-3);
}

.anz-chatbot__thinking span:nth-child(2) {
  animation-delay: 0.14s;
}

.anz-chatbot__thinking span:nth-child(3) {
  animation-delay: 0.28s;
}

.anz-chatbot__form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.anz-chatbot__form textarea {
  min-height: 44px;
  max-height: 110px;
  resize: vertical;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px 11px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
  outline: none;
}

.anz-chatbot__form textarea:focus {
  border-color: var(--vp-c-brand-2);
}

.anz-chatbot__form button {
  min-width: 58px;
  align-self: stretch;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  cursor: pointer;
  font-weight: 700;
}

.anz-chatbot__form button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@keyframes anz-chatbot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (max-width: 640px) {
  .anz-chatbot {
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
  }

  .anz-chatbot__launcher,
  .anz-chatbot__panel {
    pointer-events: auto;
  }

  .anz-chatbot__launcher {
    margin: 0 16px 16px 0;
  }

  .anz-chatbot__panel {
    width: 100vw;
    height: min(680px, calc(100dvh - 16px));
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 8px 8px 0 0;
  }
}
</style>
