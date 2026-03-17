<script setup lang="ts">
import { useData } from 'vitepress'

const { lang } = useData()
const isEn = () => lang.value === 'en'

const content = {
  zh: {
    title: '关于本项目',
    p1: '本站为一个非营利性的开源公益项目，旨在为新西兰生活和办事提供实用的避坑指南。内容基于笔者的亲身经历及互联网经验整理而成。',
    p2Before: '笔者极力尊重版权，引用内容均尽量注明出处。若有部分引用遗漏，恳请通过邮箱 ',
    p2After: ' 联系我，我会第一时间修正。',
    p3: '如果这些指南对你有所帮助，请点击右上角前往 GitHub 仓库点亮 Star。更欢迎大家通过 Pull Request 提交你的宝贵经验，让我们一起完善这份互助手册！',
    p4: '如果发现错误，欢迎通过 PR 修改。',
    p5: '转载或引用请注明出处'
  },
  en: {
    title: 'About This Project',
    p1: 'This site is a non-profit open source initiative that provides practical guides for living and getting things done in New Zealand. Content is based on personal experience and information gathered from the internet.',
    p2Before: 'We respect copyright and aim to attribute all cited content. If you notice any missing attributions, please contact us at ',
    p2After: ' and we will correct it promptly.',
    p3: 'If these guides have been helpful, please visit our GitHub repo (top right) and give us a Star. We warmly welcome Pull Requests to share your experience and improve this community handbook!',
    p4: 'Found an error? Feel free to fix it with a PR.',
    p5: 'Reprint or reference please indicate the source'
  }
}
</script>

<template>
  <div class="hidden md:block mt-12 py-8 text-center rounded-xl text-normal leading-[1.7] bg-gray-100">
    <h3 class="mb-4 text-lg font-semibold">{{ isEn() ? content.en.title : content.zh.title }}</h3>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p1 : content.zh.p1 }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p2Before : content.zh.p2Before }}<a href="mailto:2411663991@qq.com" class="text-blue-700 no-underline hover:underline">2411663991@qq.com</a>{{ isEn() ? content.en.p2After : content.zh.p2After }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p3 : content.zh.p3 }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p4 : content.zh.p4 }}</p>
    <p class="mb-3 last:mb-0 font-bold">{{ isEn() ? content.en.p5 : content.zh.p5 }}</p>
  </div>

  <div class="md:hidden mt-4 px-6 py-8 text-center text-sm leading-[1.7] bg-gray-100">
    <h3 class="mb-4 text-lg font-semibold">{{ isEn() ? content.en.title : content.zh.title }}</h3>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p1 : content.zh.p1 }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p2Before : content.zh.p2Before }}<a href="mailto:2411663991@qq.com" class="text-blue-700 no-underline hover:underline">2411663991@qq.com</a>{{ isEn() ? content.en.p2After : content.zh.p2After }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p3 : content.zh.p3 }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p4 : content.zh.p4 }}</p>
    <p class="mb-3 last:mb-0">{{ isEn() ? content.en.p5 : content.zh.p5 }}</p>
  </div>
</template>
