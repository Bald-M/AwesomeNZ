// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import { inBrowser, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LayoutWrapper from './components/LayoutWrapper.vue'
import './style.css'

const preferredLocaleKey = 'awesome-nz-preferred-locale'

function normalizePath(path: string) {
  return path.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
}

function setupDefaultLocale() {
  if (!inBrowser) return

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const localeLink = target.closest<HTMLAnchorElement>('a[lang="zh-CN"], a[lang="en"]')
    const lang = localeLink?.getAttribute('lang')
    if (lang === 'zh-CN') localStorage.setItem(preferredLocaleKey, 'zh')
    if (lang === 'en') localStorage.setItem(preferredLocaleKey, 'en')
  })

  const rootPath = normalizePath(new URL(withBase('/'), window.location.origin).pathname)
  const currentPath = normalizePath(window.location.pathname)

  if (currentPath === rootPath && localStorage.getItem(preferredLocaleKey) !== 'zh') {
    localStorage.setItem(preferredLocaleKey, 'en')
    window.location.replace(withBase('/en/'))
  }
}

export default {
  extends: DefaultTheme,
  Layout: LayoutWrapper,
  enhanceApp() {
    setupDefaultLocale()
  }
} satisfies Theme
