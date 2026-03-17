<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
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
    </template>
  </DefaultTheme.Layout>
</template>
