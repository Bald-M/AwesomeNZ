# AGENTS.md

## 项目概览

AwesomeNZ 是一个面向中文用户的新西兰生活办事实用指南站，基于 VitePress 和 Tailwind CSS 构建。项目是纯前端静态站点，没有后端服务、数据库或运行时 API；核心内容都在 `docs/` 目录下，以 Markdown 页面和就近图片资源组成。

## 技术栈与运行环境

- 使用 Node.js 20.19.x；README 和 GitHub Actions 都以 20.19 为准。
- 包管理以 pnpm 为主。仓库同时存在 `package-lock.json` 和 `pnpm-lock.yaml`，但贡献流程、部署流程和脚本示例均使用 pnpm。
- VitePress 配置位于 `docs/.vitepress/config.mts`。
- Tailwind 通过 `@tailwindcss/vite` 插件接入，并在 `docs/.vitepress/theme/style.css` 中 `@import "tailwindcss"`。

## 常用命令

```bash
pnpm install
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
```

- `pnpm run docs:build` 会先构建 VitePress，再运行 `generate-sitemap.mjs` 生成 `docs/.vitepress/dist/sitemap.xml` 和 `docs/.vitepress/dist/robots.txt`。
- 构建产物和缓存目录已在 `.gitignore` 中忽略，不要手动提交 `docs/.vitepress/dist/`、`docs/.vitepress/cache/`、`node_modules/` 或 `.pnpm-store/`。

## 文件结构速览

```text
.
├── .github/workflows/deploy.yml        # GitHub Pages 部署流程
├── docs/                               # VitePress 文档根目录
│   ├── index.md                        # 首页 frontmatter
│   ├── .vitepress/
│   │   ├── config.mts                  # 站点、导航、侧边栏、本地搜索配置
│   │   └── theme/
│   │       ├── index.ts                # 扩展默认主题
│   │       ├── style.css               # 全局样式与 Tailwind 入口
│   │       └── components/
│   │           ├── HomeFooter.vue      # 首页底部说明
│   │           └── LayoutWrapper.vue   # 注入首页底部组件
│   ├── pre-departure-medical/          # 出国体检
│   ├── criminal-record/                # 无犯罪记录证明
│   ├── bank-statement/                 # 银行流水
│   ├── medical-care/                   # 看病、急诊、报销
│   └── visa/                           # 学生签证、毕业后工签
├── generate-sitemap.mjs                # 生产构建后的 sitemap/robots 生成脚本
├── package.json                        # 脚本与前端依赖
├── pnpm-lock.yaml                      # pnpm 锁文件
└── README.md                           # 项目说明与贡献指南
```

当前内容结构约定：

- 页面文件基本使用目录式路由：`docs/<section>/<topic>/index.md`。
- 图片资源放在对应页面目录下的 `images/` 子目录中，用相对路径引用，例如 `![说明](./images/image_1.png)`。
- 主要栏目包括 `pre-departure-medical`、`criminal-record`、`bank-statement`、`medical-care`、`visa`。
- `docs/visa/work-visas/work-visa/` 目前只有空目录和 `images/`，没有页面文件；新增内容前先确认是否需要补齐页面并注册导航。

## 内容编辑约定

- 站点主要面向中文读者，新增指南默认使用简体中文；英文 locale 目前只保留基础配置，尚未建立完整英文内容树。
- 新增页面时优先遵循现有模式：每个主题一个目录，每个页面使用 `index.md`。
- 内容以可操作步骤为主，适合包含材料清单、办理入口、流程、注意事项、费用和时间信息。
- 涉及签证、医疗、费用、政策、办理入口等容易变化的信息时，尽量写明信息获取时间，并优先引用官方来源。
- 如果引用互联网内容、社媒经验或第三方截图，保持出处说明；现有文章常用 `::: info 引用` 块标注来源。
- 文章末尾通常保留编辑信息，例如：

```md
---
*最后编辑：待补充* · 作者：[Bald-M](https://github.com/Bald-M)
```

## VitePress 约定

- 新增或移动 Markdown 页面后，检查并同步更新 `docs/.vitepress/config.mts` 中中文 locale 的 `themeConfig.sidebar`。
- 站内链接优先使用 VitePress 根路径形式，例如 `/visa/work-visas/post-study-work-visa/`。
- 当前配置设置了 `ignoreDeadLinks: true`，但不要依赖它掩盖错误链接；改动后仍应人工检查新链接。
- 首页内容来自 `docs/index.md` 的 frontmatter，功能卡片不一定自动对应侧边栏页面；新增栏目时要同时检查首页 feature 和侧边栏是否需要更新。
- 本地搜索通过 `themeConfig.search.provider = 'local'` 启用。

## 主题与组件

- 自定义主题扩展 VitePress 默认主题，不要替换默认布局，除非确实需要全站布局改造。
- `LayoutWrapper.vue` 只在首页 frontmatter `layout: home` 时注入 `HomeFooter.vue`。
- `HomeFooter.vue` 维护中英文两套 footer 文案；如修改中文公益说明，也同步考虑英文文案。
- 全局样式集中在 `docs/.vitepress/theme/style.css`，其中保留了 VitePress 默认主题变量覆盖和 Tailwind 入口。

## 图片与资源

- 图片应就近放在页面目录的 `images/` 文件夹中。
- 截图优先使用 PNG，照片可使用 JPEG；上传前压缩，避免页面加载过慢。
- 不要把生成产物里的资源复制回源目录；源图片应维护在对应文章目录下。
- 避免提交 `.DS_Store`、临时截图、未压缩的大图或与文章无关的媒体文件。

## 构建、部署与 SEO

- GitHub Pages 部署配置在 `.github/workflows/deploy.yml`，推送到 `main` 或 `master` 时触发，也可手动触发。
- 部署使用 pnpm 9、Node.js 20.19，并执行 `pnpm install --frozen-lockfile` 与 `pnpm run docs:build`。
- 生产构建时 workflow 设置 `BASE_PATH=/`，这是自定义域名下资源路径正确加载的关键配置。
- `generate-sitemap.mjs` 默认站点地址为 `https://www.awesome-nz.com`，可用 `SITE_URL` 覆盖；路径前缀可用 `BASE_PATH` 覆盖。

## 修改建议清单

- 改内容页面：编辑对应 `docs/**/index.md`，必要时同步图片、侧边栏和首页 feature。
- 新增主题：创建 `docs/<section>/index.md` 或 `docs/<section>/<topic>/index.md`，添加 `images/`，再更新 `docs/.vitepress/config.mts`。
- 改导航：只改 `docs/.vitepress/config.mts`，注意中文 locale 是当前主站内容。
- 改首页：编辑 `docs/index.md` 的 frontmatter；首页底部说明在 `HomeFooter.vue`。
- 改样式：优先在 `docs/.vitepress/theme/style.css` 里做小范围变量或样式调整。
- 改部署或站点地图：分别查看 `.github/workflows/deploy.yml` 和 `generate-sitemap.mjs`。

## 验证建议

- 内容或导航变更后，至少运行 `pnpm run docs:build`。
- 样式、首页或主题组件变更后，运行 `pnpm run docs:dev` 并在浏览器检查桌面和移动宽度。
- sitemap 或部署相关变更后，确认 `pnpm run docs:build` 成功，并检查输出中 sitemap/robots 的生成信息。

