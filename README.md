# Awesome NZ

新西兰生活办事实用指南 — 出国与新西兰日常办事一站式参考。

## 内容概览

- **出国体检**：胸片体检指定医院、材料、流程
- **无犯罪记录证明**：中国（粤省事）、新西兰（奥克兰）线上办理
- **银行流水**：ANZ、招商银行电子流水获取方法
- **看病**：GP、急诊（White Cross）、学生保险报销
- **签证**：学生签证材料与流程

更多内容详见站内指南。

## 技术栈

- [VitePress](https://vitepress.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

> **本项目为纯前端项目**，无需后端服务或数据库，所有内容均为静态 Markdown 与资源文件。

## 环境要求

- **Node.js**：20.19.3（推荐使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 管理版本）

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

## 如何贡献

欢迎通过 Pull Request 补充或修正内容，一起完善这份互助手册。

> 本项目为**纯前端**项目，基于 VitePress 构建，无后端服务。所有内容均为静态 Markdown 与图片资源。

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
- 内容以实用、可操作为主
- 涉及时效性信息（日期、费用、政策）请尽量注明获取时间
- 尊重版权，引用他人内容请注明出处

## 转载说明

转载或引用请注明出处。
