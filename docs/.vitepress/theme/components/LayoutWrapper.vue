<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ChatBot from './ChatBot.vue'
import HomeFooter from './HomeFooter.vue'

const { frontmatter } = useData()
const isHome = () => frontmatter.value.layout === 'home'
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <div v-if="isHome()">
        <HomeFooter />
      </div>
      <ChatBot />
    </template>
  </DefaultTheme.Layout>
</template>
