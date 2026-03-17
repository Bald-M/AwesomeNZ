// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LayoutWrapper from './components/LayoutWrapper.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: LayoutWrapper,
  // enhanceApp({ app, router, siteData }) {
  //   // ...
  // }
} satisfies Theme
