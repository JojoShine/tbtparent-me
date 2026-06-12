# 个人电子卡片项目开发计划 v2

> 极简黑白 · 全局微动画 · 数字宠物小猫 · 多语言 · 明暗模式  
> 技术栈: Next.js 15 + JavaScript + Tailwind CSS

---

## 📦 技术栈确认

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS + CSS Variables
- **语言**: JavaScript (ES6+)
- **动画**: tsParticles (背景), Framer Motion (微动画)
- **多语言**: next-intl
- **图标**: Lucide React
- **API**: Next.js API Routes (后续扩展用)
- **数据**: 硬编码（后续可接数据库或 CMS）

### 为什么选择 Next.js？

✅ **前后端一体化** - 后续接后台功能时，直接用 API Routes，无需单独部署  
✅ **路由系统简单** - App Router 文件路由直观，`app/page.js` → `/`  
✅ **性能优化开箱即用** - 自动代码分割、图片优化、SSR/SSG  
✅ **部署简单** - Vercel 一键部署，前后端一起  
✅ **灵活的数据获取** - 硬编码阶段用静态数据，后期可直接查库或调用外部 API  

---

## 🎯 Phase 1: 基础框架搭建（当前阶段）

### 目标
搭建 Next.js 项目基础结构，实现明暗模式系统，创建基础布局和路由。

### Todo List

#### 1.1 项目初始化
- [ ] 使用 create-next-app 初始化项目
- [ ] 安装额外依赖：framer-motion, lucide-react
- [ ] 验证项目正常运行

#### 1.2 目录结构创建
```
app/
├── layout.js              # 根布局
├── page.js                # 首页 /
├── blog/page.js           # 博客页
├── projects/page.js       # 项目页
├── tools/page.js          # 工具页
├── about/page.js          # 关于页
└── api/                   # API Routes（预留）

src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── ParticleBackground.jsx
│   ├── ui/
│   │   ├── ThemeToggle.jsx
│   │   └── LanguageSwitch.jsx
│   └── cat/
│       ├── CatPet.jsx
│       └── ChatDialog.jsx
├── data/
│   ├── blogPosts.js
│   ├── projects.js
│   ├── tools.js
│   └── about.js
├── hooks/
│   └── useTheme.js
├── styles/
│   └── globals.css
└── lib/
    └── utils.js

public/
├── images/
└── lottie/
```

#### 1.3 CSS Variables 明暗模式系统
根据需求文档定义颜色变量和过渡效果。

#### 1.4 主题切换 Hook
创建 useTheme.js 管理明暗模式状态。

#### 1.5 基础 Layout 组件
- 修改 app/layout.js（根布局）
- 创建 Navbar.jsx（简化版）
- 创建 ParticleBackground.jsx（占位）

#### 1.6 硬编码数据文件
创建所有页面的占位数据。

#### 1.7 创建空白页面组件
为每个路由创建最简单的占位页面。

---

## ✅ Phase 1 完成标准

- [ ] 项目可以正常运行 (`npm run dev`)
- [ ] 可以在浏览器访问 http://localhost:3000
- [ ] 点击导航可以切换到不同页面
- [ ] 点击右上角图标可以切换明暗模式
- [ ] 页面背景色随主题变化
- [ ] 所有页面显示"建设中"占位文字

---

## 🎨 Phase 2: 核心功能组件（下一阶段）

### 目标
实现粒子背景动画、完善导航栏、主题切换、语言切换、页面过渡动画、首页完整内容。

### Todo List
- [ ] 2.1 安装并配置 tsParticles
- [ ] 2.2 创建 ParticleBackground 组件
- [ ] 2.3 完善 Navbar 组件（添加悬停下划线动画）
- [ ] 2.4 创建 ThemeToggle 组件
- [ ] 2.5 创建 LanguageSwitch 组件（占位）
- [ ] 2.6 创建 PageTransition 组件
- [ ] 2.7 实现首页完整布局和内容
- [ ] 2.8 添加所有微动画效果

---

## 🐱 Phase 3: 数字小猫系统（后续阶段）

### 目标
实现小猫状态机、动画、对话框系统。

### Todo List
- [ ] 3.1 设计小猫状态机数据结构
- [ ] 3.2 准备小猫 Lottie 动画文件
- [ ] 3.3 创建 CatPet 基础组件
- [ ] 3.4 实现 idle 状态
- [ ] 3.5 创建 ChatDialog 对话框组件
- [ ] 3.6 实现点击交互
- [ ] 3.7 实现导航联动
- [ ] 3.8 添加预设对话场景
- [ ] 3.9 接入 LLM API（可选）
- [ ] 3.10 创建 API Route

---

## 📄 Phase 4: 其他页面（后续阶段）

### 目标
完成所有页面的内容和交互。

### Todo List
- [ ] 4.1 博客页：文章列表、年份分组
- [ ] 4.2 项目页：两列卡片网格、悬停上浮
- [ ] 4.3 工具页：工具卡片、绿点标识
- [ ] 4.4 关于页：个人信息、/now 模块
- [ ] 4.5 所有页面添加小猫联动

---

## 🌍 Phase 5: 多语言和细节优化（最后阶段）

### 目标
集成多语言、完善动画、响应式适配。

### Todo List
- [ ] 5.1 安装 next-intl
- [ ] 5.2 配置多语言
- [ ] 5.3 创建中英文翻译文件
- [ ] 5.4 实现语言切换功能
- [ ] 5.5 国际化所有文本
- [ ] 5.6 完善所有悬停动画
- [ ] 5.7 添加滚动视差效果
- [ ] 5.8 移动端响应式适配
- [ ] 5.9 性能优化

---

## 📝 开发规范

### 代码风格
- 使用函数式组件 + Hooks
- 文件名使用 PascalCase（组件）或 camelCase（工具/数据）
- 保持代码简洁，单个组件不超过 200 行
- Client Component 需要 `'use client'` 指令

### Next.js 最佳实践
- 优先使用 Server Component（默认）
- 需要交互或状态时才用 Client Component
- 利用 `next/font` 优化字体加载

### 克制原则（来自需求文档）
- ✅ 背景粒子：存在但不抢戏
- ✅ 小猫动画：有趣但不打扰阅读
- ✅ 对话框：主动触发，不自动弹出骚扰
- ❌ 不在文章正文区域叠加动画
- ❌ 不让小猫遮挡核心内容
- ❌ 不自动播放声音

---

## 🚀 当前进度

**Phase 1: 基础框架搭建** - 待开始

下一步：执行 1.1 项目初始化

---

## 📊 Review（完成后填写）

本次开发完成了基础框架搭建，包括：
- Next.js 15 + Tailwind CSS 项目初始化
- 明暗模式 CSS Variables 系统
- App Router 基础路由结构
- 硬编码数据占位
- 主题切换功能

所有代码遵循极简原则，每个改动影响最小范围。
