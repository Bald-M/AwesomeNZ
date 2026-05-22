# Awesome NZ

新西兰生活办事实用指南 — 出国与新西兰日常办事一站式参考。

## 内容概览

- **出国体检**：胸片体检指定医院、材料、流程
- **无犯罪记录证明**：中国（粤省事）、新西兰（奥克兰）线上办理
- **银行流水**：ANZ、BNZ、Kiwibank、招商银行电子流水获取方法
- **看病**：GP、急诊（White Cross）、学生保险报销
- **签证**：学生签证、毕业后工签材料与流程
- **站内问答助手**：基于本站 Markdown 内容生成检索索引，可选直连 DeepSeek 生成自然语言回答

更多内容详见站内指南。

## 技术栈

- [VitePress](https://vitepress.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Node.js 脚本生成站内问答索引、sitemap 与 robots.txt

> **本项目主体为纯前端静态站点**，无需数据库。GitHub Pages 部署的是静态 Markdown、图片和构建产物；问答助手会在构建时把 DeepSeek API Key 写入前端产物，适合接受 Key 暴露风险的个人低成本场景。

## 环境要求

- **Node.js**：20.19.3（推荐使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 管理版本）
- **包管理器**：pnpm

## 本地运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run docs:dev

# 构建生产版本
pnpm run docs:build

# 预览生产构建
pnpm run docs:preview
```

`pnpm run docs:dev` 和 `pnpm run docs:build` 会先运行 `generate-chat-index.mjs`，生成本地问答索引 `docs/public/chat-index.json`。该文件由构建生成，不需要手动提交。

## 本地测试问答助手与 DeepSeek

默认情况下，问答助手会先检索本站教程内容。如果没有配置 DeepSeek API Key，或者 DeepSeek 请求失败，它会显示本地检索兜底结果。

如需在本地测试 DeepSeek V4 Pro / V4 Flash：

```bash
# 复制本地环境变量模板
cp .env.example .env.local
```

在 `.env.local` 中填入你的 DeepSeek API Key：

```bash
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
VITE_DEEPSEEK_MAX_TOKENS=1200
VITE_DEEPSEEK_TEMPERATURE=0.2
```

然后启动 VitePress：

```bash
pnpm run docs:dev
```

打开页面后，右下角问答助手可在 `V4 Pro` 和 `V4 Flash` 之间切换。若回答中提示 DeepSeek 请求失败，请检查 `.env.local` 是否配置正确、DeepSeek 账户余额和模型权限是否可用。

> 注意：所有 `VITE_` 变量都会进入前端产物。`VITE_DEEPSEEK_API_KEY` 会暴露在浏览器里，本项目按“接受 Key 暴露风险”的纯前端方案处理。

## GitHub Pages 部署

本仓库通过 GitHub Actions 部署到 GitHub Pages。推送到 `main` 或 `master` 分支后会自动执行：

```bash
pnpm install --frozen-lockfile
pnpm run docs:build
```

如需在 GitHub Actions 中提供 DeepSeek Key，请添加 Repository Secret：

```text
Settings → Secrets and variables → Actions → Secrets → New repository secret
Name: DEEPSEEK_API_KEY
```

GitHub Actions 会在构建时把 `DEEPSEEK_API_KEY` 注入为 `VITE_DEEPSEEK_API_KEY`，前端会直接请求 `https://api.deepseek.com/chat/completions`。线上未配置该 Secret 时，站点仍会正常构建和部署，问答助手会使用本地教程检索兜底。

## 如何贡献

欢迎通过 Pull Request 补充或修正内容，一起完善这份互助手册。

> 本项目为**静态文档站**，基于 VitePress 构建。所有指南内容均为 Markdown 与图片资源；聊天助手在浏览器端直接调用 DeepSeek。

### 贡献流程

1. **Fork 本仓库**，将项目 fork 到你的 GitHub 账号下
2. **克隆仓库**：`git clone https://github.com/<你的用户名>/AwesomeNZ.git`
3. **创建分支**：`git checkout -b feature/xxx` 或 `fix/xxx`
4. **修改内容**：在 `docs/` 目录下编辑或新增 Markdown 文件；若新增/调整了页面，记得同步修改 `docs/.vitepress/config.mts` 的 `sidebar`
5. **本地预览**：`pnpm run docs:dev` 确认效果
6. **提交变更**：`git add .` → `git commit -m "描述你的修改"`
7. **推送并创建 PR**：推送到你的 fork，在 GitHub 上创建 Pull Request

### 新增主题的目录与文件结构（以「银行流水」为例）

假设你要新增「银行流水」这一主题，可按以下步骤创建文件：

```
docs/
└── bank-statement/           # 1. 在 docs 下创建主题目录
    ├── index.md              # 2. 创建总览页，介绍银行流水办理概况
    ├── anz/                  # 3. 创建 ANZ 子主题
    │   ├── index.md          #    ANZ 流水获取的具体步骤
    │   └── images/           # 4. 创建 images 目录，存放该子主题的截图
    │       ├── step1.png
    │       └── step2.png
    └── cmb/                  # 5. 创建招商银行子主题
        ├── index.md
        └── images/
```

**步骤说明：**

1. 在 `docs/` 下新建 `bank-statement/` 目录
2. 在 `bank-statement/` 下创建 `index.md`，作为该主题的入口总览页
3. 新建子目录（如 `anz/`、`cmb/`），各子目录下创建 `index.md` 写具体操作步骤
4. 在子目录下创建 `images/` 目录，存放该主题相关的截图或示意图
5. **在 `docs/.vitepress/config.mts` 的 `sidebar` 中注册新页面链接**（编辑完内容后务必执行此步，否则新页面不会出现在侧边栏）

**图片上传规范：**

- 所有图片上传前**务必压缩**，建议使用 [TinyPNG](https://tinypng.com/) 等工具
- 控制单张图片体积，避免影响页面加载速度
- 推荐格式：PNG（截图）、JPEG（照片）

### 贡献内容示例

- 补充或更新现有指南（材料清单、流程步骤、联系方式等）
- 新增办事场景（如其他银行流水、其他城市无犯罪证明等）
- 修正错字、过时信息或表述不清之处
- 完善文档结构或排版

### 注意事项

- **编辑完 `docs/` 下的 Markdown 后，若新增或调整了页面结构，请同步更新 `docs/.vitepress/config.mts` 中的 `sidebar` 配置，否则新页面无法在导航中显示**
- 内容、导航或问答索引相关改动后，请运行 `pnpm run docs:build`
- 内容以实用、可操作为主
- 涉及时效性信息（日期、费用、政策）请尽量注明获取时间
- 尊重版权，引用他人内容请注明出处

## 转载说明

转载或引用请注明出处。
