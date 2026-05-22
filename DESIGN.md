# AwesomeNZ 设计与样式指南

本文件记录 AwesomeNZ 的前端设计语言、视觉主题、内容排版、组件、布局、响应式与落地检查规则。项目结构、运行命令、内容目录和贡献流程仍以 `AGENTS.md` 与 `README.md` 为准；新增或调整页面时，设计与样式优先参考本文件。

## 1. 视觉主题

AwesomeNZ 是面向中文用户的新西兰生活办事实用指南站。视觉目标不是营销转化，而是让用户在焦虑、赶时间或不熟悉英文流程时，能快速确认“我在哪一步、要准备什么、下一步怎么做”。

- 首页：使用 VitePress Home 布局，突出 `Awesome NZ`、`生活办事实用指南` 和出国/新西兰生活办事的一站式定位。首页卡片用于入口索引，不做复杂活动页或大面积装饰区。
- 指南页：以可操作步骤为核心，优先呈现材料清单、办理入口、步骤截图、注意事项、费用、时间和相关链接。
- 中英文站点：中文是当前主站内容；英文 locale 已存在基础结构，新增英文内容时保持与中文页面同级、同路由语义和相近排版。
- 辅助问答：浮动 AwesomeNZ 助手只作为站内检索入口，不替代正文，也不遮挡主要阅读路径。
- 图片与素材：以真实截图、官方页面截图、实拍照片为主，帮助用户识别页面和办理现场；不要使用纯装饰图替代步骤证据。

## 2. 色彩系统

项目当前主要继承 VitePress 默认主题，并在 `docs/.vitepress/theme/style.css` 中覆盖少量 CSS 变量。新增样式优先使用 VitePress 变量、默认主题能力和少量 Tailwind 工具类。

### 品牌与链接

- 主品牌色使用 VitePress `indigo` 体系：`--vp-c-brand-1`、`--vp-c-brand-2`、`--vp-c-brand-3`、`--vp-c-brand-soft`。
- 链接、主按钮、助手发送按钮、来源链接、tip 色块等优先使用 `brand` 语义变量，不另起一套硬编码蓝色。
- 首页 hero 名称渐变当前为 `#bd34fe` 到 `#41d1ff`；hero 背景光效使用 `#bd34fe` 与 `#47caff`。如要调整品牌感，集中修改这些变量。

### 中性色与内容面

- 正文、边框、背景优先使用 `--vp-c-text-*`、`--vp-c-bg`、`--vp-c-bg-soft`、`--vp-c-divider`。
- 首页底部说明当前使用 Tailwind `bg-gray-100`；邮箱链接使用 `text-blue-700`。若后续增强主题一致性，可迁移到 VitePress 变量。
- 表格、引用块、代码块、搜索框和导航使用 VitePress 默认对比度，不要写死白底或浅灰文字，以免暗色模式失效。

### 状态色

- `tip` 复用品牌色，适合提示准备事项、入口说明和温和提醒。
- `warning` 使用 VitePress yellow 体系，适合政策风险、费用变动、错误选择提醒。
- `danger` 使用 VitePress red 体系，适合明确禁止、严重后果或过期信息警示。
- `info` 可用于引用来源、补充说明和第三方经验出处。

## 3. 字体规则

- 全站使用 VitePress 默认字体栈，组件内需要继承时使用 `var(--vp-font-family-base)`。
- 中文内容以系统中文字体自然回退为主，不引入装饰字体或单独加载大型字体文件。
- 首页 hero 可以保留 VitePress 默认大标题层级；指南正文保持文档站密度，避免把步骤页做成营销长页。
- 标题应短而具体，例如“申请前准备”“Step 3：创建新申请”“相关链接”。
- 按钮、标签、表格列名和导航文案要短；复杂说明放在正文、tip/warning 块或表格说明列中。
- 不要用 viewport 宽度缩放字体。长链接、英文专有名词和长步骤说明应允许换行或放入表格/列表，避免撑破移动端布局。

## 4. 内容页面规范

- 页面优先使用目录式路由：`docs/<section>/<topic>/index.md`。
- 页面开头可使用 frontmatter：常见字段包括 `description`、`outline: deep`；首页使用 `layout: home`。
- 每篇指南建议包含：场景说明、信息时效提示、材料清单、办理流程、注意事项、相关链接、最后编辑信息。
- 涉及签证、医疗、费用、政策、办理入口等容易变化的信息时，写明信息获取或最后编辑日期，并优先引用官方来源。
- 步骤型页面使用 `Step 1`、`Step 2` 或清晰的二/三级标题，截图紧跟对应步骤。
- 材料、费用、地址、联系电话、文件格式等结构化信息优先用 Markdown 表格。
- 引用互联网内容、社媒经验或第三方截图时，使用 `::: info 引用` 块注明来源。
- 文章末尾保留编辑信息，格式参考：

```md
---
*最后编辑：2026-03-23* · 作者：[Bald-M](https://github.com/Bald-M)
```

## 5. 组件样式

- 默认布局由 `docs/.vitepress/theme/index.ts` 扩展 VitePress DefaultTheme，不要替换默认布局，除非确实要做全站级改造。
- `LayoutWrapper.vue` 用于在默认布局底部注入首页 footer 和 ChatBot。新增全站组件时优先通过这里挂载，并确认不会影响普通文档页阅读。
- `HomeFooter.vue` 维护中英文两套公益说明。修改中文公益、版权或联系文案时，同步检查英文文案。
- `ChatBot.vue` 使用固定右下角浮层：桌面面板宽度约 `390px`，圆角 `8px`，移动端变为底部抽屉。新增样式应继续使用 `--vp-*` 变量，并保证不遮挡正文主要操作。
- 首页 feature 卡片由 `docs/index.md` frontmatter 驱动。新增栏目时同时检查首页 feature、导航和 sidebar 是否需要同步。
- 不要在内容页堆叠自定义卡片组件；Markdown 标题、列表、表格、VitePress custom block 已足够表达大多数指南结构。

## 6. 布局原则

- 全站以 VitePress 文档体验为主：顶部导航 + 侧边栏 + 正文 + 本地搜索。
- 中文 locale 的导航和侧边栏配置位于 `docs/.vitepress/config.mts` 的 `locales.root.themeConfig`；英文位于 `locales.en.themeConfig`。
- 新增或移动 Markdown 页面后，必须同步检查 sidebar 链接；不要依赖 `ignoreDeadLinks: true` 掩盖错误链接。
- 首页保持轻量入口页，不加入过多正文说明；详细内容放到对应指南页。
- 指南总览页负责解释主题边界和分流到子页面；具体页面负责完整步骤。
- 站内链接优先使用 VitePress 根路径形式，例如 `/visa/work-visas/post-study-work-visa/`。
- 页面区块通过标题层级、空白、表格和提示块建立层次，不使用复杂嵌套容器。

## 7. 图片与资源

- 图片就近放在页面目录下的 `images/` 子目录，使用相对路径引用，例如 `![说明](./images/image_1.png)`。
- 截图优先 PNG；照片可使用 JPEG。上传前压缩，避免影响文档加载。
- 图片 alt 文案要说明截图或场景内容，方便搜索、无障碍和维护。
- 一张图只服务当前步骤或当前说明，不要把多个无关截图拼成难以阅读的大长图。
- 不要从 `docs/.vitepress/dist/` 复制构建产物回源目录。
- 不提交 `.DS_Store`、临时截图、未压缩大图或与文章无关的媒体。

## 8. 响应式与可访问性

- VitePress 默认断点负责桌面、平板和移动端布局；新增 CSS 时先确认默认主题是否已覆盖该场景。
- 首页 footer 当前桌面为圆角浅灰块，移动端为全宽浅灰块；修改时保持移动端阅读宽度和行高舒适。
- ChatBot 在 `max-width: 640px` 下占据底部宽度并使用 `100dvh` 约束；调整时要检查小屏键盘和滚动体验。
- 表格在移动端可能横向溢出，新增宽表时尽量控制列数；必要时拆成多个小表。
- 按钮、链接和浮动入口需要有可理解的 `aria-label` 或文本；纯符号按钮必须有 `title`/`aria-label`。
- 暗色模式下不要写死浅色背景和低对比文字；优先使用 VitePress 变量。

## 9. Do's & Don'ts

### Do

- 优先沿用 VitePress 默认主题、CSS 变量和 Markdown 能力。
- 新增指南时先想清楚用户要完成的任务，再组织材料、入口、步骤、注意事项和结果确认。
- 使用真实截图帮助用户核对页面，不用抽象插图装饰步骤页。
- 对费用、政策、审理时间、医疗和签证要求写明时效，并提醒用户以官方最新信息为准。
- 中英文页面并行维护时，保持路由、标题层级、截图顺序和相关链接大体一致。
- 修改首页、主题组件或全局样式后，检查桌面和移动端效果。

### Don't

- 不要把 AwesomeNZ 做成营销官网、资讯门户或后台系统风格。
- 不要在普通指南页添加大面积 hero、装饰渐变、复杂卡片墙或无关视觉素材。
- 不要散落新的硬编码色值；确需新增品牌色时，先沉淀到 `style.css` 变量。
- 不要让长英文链接、表格、按钮文案或截图撑破移动端。
- 不要提交构建产物、缓存目录或未经压缩的大图。
- 不要引用第三方内容却不说明来源。

## 10. 设计资料与落地检查

### 主要资料来源

- VitePress 配置：`docs/.vitepress/config.mts`
- 全局样式与 Tailwind 入口：`docs/.vitepress/theme/style.css`
- 主题扩展：`docs/.vitepress/theme/index.ts`
- 布局注入：`docs/.vitepress/theme/components/LayoutWrapper.vue`
- 首页底部说明：`docs/.vitepress/theme/components/HomeFooter.vue`
- 浮动问答助手：`docs/.vitepress/theme/components/ChatBot.vue`
- 首页内容：`docs/index.md`
- 英文首页：`docs/en/index.md`
- 站内问答索引生成：`generate-chat-index.mjs`
- sitemap/robots 生成：`generate-sitemap.mjs`

### 新增或修改页面检查清单

- 是否属于现有栏目，还是需要新增 section。
- 是否使用 `docs/<section>/<topic>/index.md` 和就近 `images/`。
- 是否同步更新中文 sidebar；若有英文页面，是否同步更新英文 sidebar。
- 首页 feature 是否需要新增、改名或重排。
- 页面是否有清晰的任务说明、材料清单、步骤、注意事项和相关链接。
- 涉及时效信息是否注明日期或提醒以官方为准。
- 截图是否压缩、命名清晰、alt 文案准确。
- 引用来源是否用 `::: info 引用` 或正文链接标注。
- 移动端表格、截图、长链接和 ChatBot 是否不遮挡、不溢出。
- 内容或导航变更后是否运行 `pnpm run docs:build`。
