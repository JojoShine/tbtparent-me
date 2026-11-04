export const productProfiles = [
  { slug: 'flowcraft', ready: true, aliases: ['FlowCraft'], name: 'FlowCraft', accent: '#236a60', category: '项目交付工作台', headline: '从一个想法，\n到有迹可循的交付。', actionLabel: '进入工作台' },
  { slug: 'around-me', aliases: ['AroundMe', 'Around Me'], name: 'AroundMe', accent: '#795ac2', category: '个人数字分身 · 规划中', headline: '让知识与记忆，\n陪你跨越设备。' },
  { slug: 'data-mesh', aliases: ['DataMesh'], name: 'DataMesh', accent: '#3755ab', category: '一体化数据服务体系', headline: '让数据流转、治理与使用，\n连接起来。' },
  { slug: 'custom-wechat-app', aliases: ['custom_wechat_app'], name: 'custom_wechat_app', accent: '#25835c', category: '微信小程序全栈底座', headline: '把通用微信能力沉淀下来，\n为业务留下空间。', qrLabel: '扫码体验小程序' },
  { slug: 'custom-app', aliases: ['custom_app'], name: 'custom_app', accent: '#386ea7', category: 'Flutter App 与支撑平台', headline: '通用能力进入底座，\n差异留给你的业务。', actionLabel: '查看接入文档', qrLabel: 'Android 测试版' },
  { slug: 'app-portfolio', aliases: ['app-portfolio'], name: 'app-portfolio', accent: '#325d47', category: '移动应用演示集合', headline: '移动端业务应用集' },
  { slug: 'qingwen', aliases: ['Qingwen', '轻问'], name: '轻问', accent: '#32766d', category: '轻量问卷工具', headline: '轻松创建，高效收集。\n让每一次提问都有价值。', actionLabel: '打开轻问' },
  { slug: 'owl', aliases: ['Owl'], name: 'Owl', accent: '#735b9f', category: '企业管理后台基础框架', headline: '从具体业务开始，\n复用完整的后台基础能力。', actionLabel: '访问管理后台' },
  { slug: 'ant-eyes', aliases: ['ant-eyes'], name: 'ant-eyes', accent: '#847031', category: 'Linux 运维工具集', headline: '把常用运维流程，\n收进一个命令入口。', actionLabel: '查看 npm 包' },
  { slug: 'common-rag', aliases: ['Common RAG'], name: 'Common RAG', accent: '#596773', category: '历史项目', headline: '文档检索与问答的\n一次工程实践。' },
  { slug: 'taskhub', aliases: ['TaskHub'], name: 'TaskHub', accent: '#596773', category: '历史项目', headline: '项目协作的早期探索，\n能力延续至 FlowCraft。' },
]

Object.assign(productProfiles.find(profile => profile.slug === 'data-mesh'), {
  ready: true,
  category: '一体化数据服务体系',
  keywords: ['DataMesh', '数据交换', '数据治理', '数据资产', '数据安全', 'AI 智能问数'],
  summary: '由数据交换、数据治理、数据资产与数据安全四个独立平台组成，以统一身份认证连接，AI 智能问数作为旁路能力贯穿全局。项目建设中。',
  project: { status: 'in_progress', github: 'https://github.com/JojoShine/DataMesh' },
  platforms: [
    { id: 'exchange', name: '数据交换', headline: '让数据流转有统一入口。', description: '围绕数据共享、交换任务与传输过程，组织数据流转相关工作。', topics: ['数据共享', '交换任务', '传输过程管理'] },
    { id: 'governance', name: '数据治理', headline: '把治理工作连接成完整链路。', description: '围绕数据的理解、规范与质量，覆盖元数据、血缘、标准、规则及治理任务。', topics: ['元数据', '数据血缘', '数据标准', '数据质量', '治理规则', '治理任务'] },
    { id: 'assets', name: '数据资产', headline: '让数据可发现，也能被理解。', description: '组织数据目录、检索与业务定义，连接数据的理解、发现和使用申请。', topics: ['数据目录', '资产检索', '业务含义', '使用申请'] },
    { id: 'security', name: '数据安全', headline: '围绕数据使用，建立管理边界。', description: '围绕安全策略、访问控制、风险排查和操作审计，组织数据安全管理工作。', topics: ['安全策略', '访问控制', '风险排查', '操作审计'] },
  ],
  coordination: [
    { title: '专业边界', description: '四个平台分别承载交换、治理、资产与安全工作，保留各自的专业范围。' },
    { title: '统一身份', description: '以统一身份认证连接四个平台，衔接权限与跨平台使用体验。' },
    { title: '数据上下文', description: '在跨平台使用与问数过程中，关注数据背景、业务含义和访问范围。' },
  ],
  aiContext: [
    { title: '数据上下文', description: '结合数据所处的业务背景理解问题。' },
    { title: '指标口径', description: '在明确指标含义与统计口径的基础上组织问数。' },
    { title: '访问权限', description: '将可访问的数据范围纳入问数能力的设计。' },
  ],
})

Object.assign(productProfiles.find(profile => profile.slug === 'owl'), {
  ready: true,
  logo: '/images/projects/owl/logo.png',
  category: '前后端一体的管理后台基础框架',
  keywords: ['Owl', '管理后台', 'NestJS', '动态 CRUD', 'API Builder', 'RBAC'],
  summary: '把用户、权限、文件、日志和通知沉淀为通用能力。通过配置驱动的 CRUD 与 SQL 接口构建，让业务系统从完整的前后端底座开始。',
  project: { pc_url: 'https://tbtparent.me/owl', github: 'https://github.com/JojoShine/owl' },
  builders: [
    { id: 'crud', label: '动态 CRUD', title: '从业务表，到可用的管理模块。', description: '读取 PostgreSQL 表结构，配置字段与页面规则，动态渲染列表、筛选和表单。', steps: [
      { title: '读取表结构', description: '选择业务表，初始化字段配置；系统表不参与生成。' },
      { title: '配置展示与录入', description: '设置列名、搜索项、表单组件、必填规则和格式化方式。' },
      { title: '发布业务模块', description: '生成页面配置、菜单与操作权限，无需生成代码文件或重启服务。' },
    ], features: ['分页与筛选', '新增、编辑与删除', '数据导入与导出'], note: '适合标准 CRUD。复杂业务规则仍通过前后端代码扩展。', href: 'https://github.com/JojoShine/owl/blob/main/docs/features/04-code-generator.md' },
    { id: 'api', label: 'SQL 接口构建', title: '把参数化 SQL，组织成数据接口。', description: '为报表、数据查询和业务对接配置 SQL 接口，维护参数、授权与调用限制。', steps: [
      { title: '配置 SQL 与参数', description: '使用参数占位符，配置参数类型、默认值和校验规则。' },
      { title: '明确调用授权', description: '为调用方创建接口密钥，选择允许访问的具体接口。' },
      { title: '发布与跟踪调用', description: '按密钥状态、有效期和限流规则校验请求，记录接口调用。' },
    ], features: ['参数绑定', '按接口授权', '调用文档与记录'], note: '动态 SQL 接口使用独立的 X-API-Key 凭证，不代表后台用户身份。', href: 'https://github.com/JojoShine/owl/blob/main/docs/features/05-api-builder.md' },
  ],
  services: [
    { title: '文件与存储', description: 'MinIO 承载文件对象，提供文件夹、上传下载、分类、权限与分享管理。', items: ['文件夹权限继承', '分享有效期与访问记录'] },
    { title: '日志与监控', description: '集中查看接口访问、操作审计与敏感访问记录，提供性能、健康检查和告警入口。', items: ['搜索与筛选', '运行状态与告警管理'] },
    { title: '消息与通知', description: '统一邮件模板、发送任务与系统通知，为业务事件提供通知入口。', items: ['SMTP 邮件服务', '站内通知与已读状态'] },
    { title: '界面与配置', description: '调整登录页品牌、系统参数与主题，配置基于 SQL 数据源的看板组件。', items: ['Logo、背景与登录布局', '可配置 Widget'] },
  ],
  questions: [
    { title: '配置能覆盖所有业务吗？', answer: '动态 CRUD 面向标准增删改查，SQL 接口面向明确的数据查询或写入。复杂流程、业务校验和数据范围规则，需要在自己的业务模块中接入并验证。' },
    { title: '看板上的数据都是实际运行数据吗？', answer: '看板支持业务数据与自定义 SQL Widget。当前默认看板的部分趋势和容量指标含示意值，接入项目时需要替换为真实数据源。' },
    { title: '短信、邮件和文件服务如何启用？', answer: '需要准备并配置对应的短信供应商、SMTP 和 MinIO 服务。自部署还需要 PostgreSQL；Redis 用于相关会话、缓存及签名防重放能力。具体配置以部署文档为准。' },
  ],
  sources: [
    { label: '文档中心', href: 'https://github.com/JojoShine/owl/blob/main/docs/README.md' },
    { label: '部署指南', href: 'https://github.com/JojoShine/owl/blob/main/docs/deployment/docker.md' },
    { label: 'MIT 许可证', href: 'https://github.com/JojoShine/owl/blob/main/LICENSE' },
  ],
})

Object.assign(productProfiles.find(profile => profile.slug === 'qingwen'), {
  ready: true,
  logo: '/images/projects/qingwen/logo.svg',
  category: '轻量开源问卷工具',
  keywords: ['轻问', 'Qingwen', '开源问卷', '自部署', '条件显示', '问卷统计'],
  summary: '从题目编排到发布收集，再到答卷统计与导出。轻问把常见调查需求放进一套可自部署的问卷工具。',
  project: { pc_url: 'https://tbtparent.me/surveys/login', github: 'https://github.com/JojoShine/qingwen.git' },
  workflow: [
    { title: '创建与编排', description: '新建问卷，选择题型、配置选项与必填规则，通过拖拽或键盘调整顺序。' },
    { title: '预览与发布', description: '试填验证题目，配置外观后发布。预览不会保存答卷，发布后锁定题目结构。' },
    { title: '分享与收集', description: '通过链接或二维码分享，支持手机和电脑填写，按时间、份数与次数控制收集。' },
    { title: '统计与整理', description: '查看各题统计与原始答卷，按条件筛选，标记无效或恢复，并导出 CSV。' },
  ],
  questionGroups: [
    { title: '选择与文字', types: '单选 / 多选 / 下拉 / 单行 / 多行', description: '配置选项、必填与“其他”补充文字，多选可设置互斥选项。' },
    { title: '数字与日期', types: '数字 / 日期与时间', description: '限制数值范围，日期可配置到日、时分或时分秒。' },
    { title: '评价与比较', types: '评分 / 排序 / 矩阵单选 / 矩阵多选', description: '按场景收集程度、偏好与同一组项目的评价。' },
    { title: '附件与分类', types: '图片 / 文档 / 分类标题', description: '按题配置附件类型和数量，用分类标题组织问卷。' },
  ],
  rules: [
    { title: '按回答显示后续题目', description: '引用前序单选、多选或下拉题的选项设置显示条件，支持级联。隐藏题不校验、不提交。' },
    { title: '按场景调整外观', description: '提供手机与 PC 背景模板，可上传 Banner，配置标题及底部品牌文案。' },
    { title: '把收集规则设清楚', description: '配置开始和截止时间、最大答卷数，以及同一浏览器或 IP 的填写次数。' },
  ],
  results: [
    { title: '先看各题统计', description: '按题型整理答卷，查看回答分布；标为无效的答卷不计入统计。' },
    { title: '再回到原始答卷', description: '查看答卷详情，按日期、答案和有效状态筛选，批量标记无效或恢复。' },
    { title: '导出后继续处理', description: 'CSV 遵循当前筛选条件并保留有效状态，方便后续整理与分析。' },
  ],
  notes: [
    { title: '账号与权限', description: '账号由管理员创建。普通用户管理自己的问卷与结果，管理员管理所有用户和问卷；公开问卷可匿名填写。' },
    { title: '发布后的修改', description: '发布后锁定题目结构，仍可调整外观。需要修改题目时，可复制为新的问卷。' },
    { title: '附件与收集边界', description: '附件支持图片和指定文档格式，受每题与整份提交的数量、大小限制。无效答卷仍占用收集份数与填写次数。' },
    { title: '当前范围', description: '支持基于前序选项的条件显示；当前不提供公开注册、多人协作、多租户、复杂跳题或考试计分。' },
  ],
  sources: [
    { label: '使用说明', href: 'https://github.com/JojoShine/qingwen#readme' },
    { label: '部署文档', href: 'https://github.com/JojoShine/qingwen/blob/main/docs/DEPLOYMENT.md' },
    { label: 'MIT 许可证', href: 'https://github.com/JojoShine/qingwen/blob/main/LICENSE' },
  ],
})

Object.assign(productProfiles.find(profile => profile.slug === 'app-portfolio'), {
  ready: true,
  logo: '/images/projects/app-portfolio/brand-mark.png',
  category: '移动 H5 应用集合',
  keywords: ['app-portfolio', '移动 H5', '应用市场', '城市服务', '业务应用'],
  summary: '一组持续维护的移动端 H5 应用，覆盖招生报名、活动运营与城市服务。每个应用有独立的业务流程，共用认证、文件和 API 基础能力。',
  project: {
    mobile_url: 'https://tbtparent.me/app-portfolio/',
    github: 'https://github.com/JojoShine/app-portfolio',
  },
  applications: [
    { id: 'enrollment', name: '招生报名', category: '教育学习', description: '面向幼儿园入学、幼升小和小升初，覆盖政策查询、学校选择、信息填报与审核结果查询。', features: ['招生政策与学校查询', '分步骤信息填报与材料提交', '报名记录、审核进度与结果查询'] },
    { id: 'coupon', name: '消费券', category: '活动运营', description: '面向促消费活动，提供用户领券、券包管理、适用商户查询和商户核销流程。', features: ['活动浏览、领券与使用规则', '适用商户查询与个人券包', '扫码或手动核销、核销记录'] },
    { id: 'green-points', name: '积分商城', category: '活动运营', description: '围绕会员积分运营，组织签到、积分获取、权益兑换和订单服务。', features: ['每日签到与积分明细', '商品、城市权益与优惠券兑换', '订单、地址、收藏与反馈'] },
    { id: 'quiz', name: '通用答题', category: '教育学习', description: '面向知识宣传、主题竞赛和培训考核，支持在线作答、即时反馈与活动成绩复盘。', features: ['主题活动与单选、多选、判断题', '即时判题、答案解析与回顾', '参与记录与排行榜'] },
    { id: 'library', name: '图书馆服务', category: '城市服务', description: '面向公共图书馆读者，整合馆藏发现、借阅服务、座位预约与阅读活动。', features: ['馆藏检索与图书详情', '借阅、续借、图书与座位预约', '阅读活动、消息与阅读计划'] },
    { id: 'snap-report', name: '随手拍', category: '城市服务', description: '面向海安市民，提供现场拍照、问题识别、位置确认与上报记录查询。', features: ['拍照或从相册选择多张照片', 'AI 辅助识别，支持手动填写', '位置确认、上报与个人记录'] },
    { id: 'policy-match', name: '政策智能匹配', category: '城市服务', description: '根据个人或企业画像逐项核对政策条件，解释匹配结果，并提供模拟申报与进度记录。', features: ['个人与企业画像、规则匹配', '条件解释、收藏与政策对比', '站内模拟申报、材料与进度记录'] },
  ],
  sources: [
    { label: '项目说明', href: 'https://github.com/JojoShine/app-portfolio#readme' },
    { label: '应用注册与能力', href: 'https://github.com/JojoShine/app-portfolio/blob/main/apps/web/src/app/registry/applications.js' },
  ],
})

Object.assign(productProfiles[0], {
  project: {
    pc_url: 'https://tbtparent.me/flowcraft/login',
    github: 'https://github.com/JojoShine/FlowCraft',
  },
  logo: '/images/projects/flowcraft/logo.svg',
  headline: '让项目从计划到交付，\n始终处在同一份上下文里。',
  summary: 'FlowCraft 是面向独立开发者和小型团队的项目工作台。以项目为核心，组织阶段、任务、文档、绘图、产物与报告，并让 AI 使用这些真实上下文。',
  problems: [
    { title: '项目过程碎片化', description: '需求、任务和阶段分散记录，难以判断当前处于哪个阶段、下一步需要推进什么。' },
    { title: '成果脱离执行过程', description: '文件放在目录里，任务留在看板里，交付产物与产生它的工作失去关联。' },
    { title: 'AI 缺少项目上下文', description: '重复向助手解释项目背景，生成内容又停留在对话里，没有沉淀为可管理的成果。' },
  ],
  construction: [
    { title: '项目推进', description: '把阶段与日常执行放在同一个项目中。', items: [
      { title: '项目与阶段', description: '维护项目状态、周期与阶段结构，组织从立项到归档的生命周期。' },
      { title: '任务看板', description: '按待办、进行中、已完成组织任务，支持优先级、里程碑、负责人和截止日期。' },
    ] },
    { title: '文档与绘图', description: '持续编写项目资料，维护可以继续编辑的图。', items: [
      { title: '文档中心', description: '按项目组织文档，支持富文本编辑、Markdown 导入、正文目录和文档嵌图，并可预览 Mermaid 图表。' },
      { title: '绘图中心', description: '使用 Excalidraw 绘制架构、流程与部署图，支持图形素材、文档引用，以及可编辑源文件和 PNG、SVG 导出。' },
      { title: '保存与版本', description: '文档和画布支持自动保存、本地草稿、历史版本与恢复，让资料可以持续维护。' },
    ] },
    { title: 'AI 与模板', description: '在项目上下文中辅助创作，复用已有内容结构。', items: [
      { title: 'AI 项目助手', description: '保存多轮会话，结合项目和模板上下文生成内容，并通过工具调用查询基础项目数据。' },
      { title: '模板中心', description: '维护常用内容模板与输出格式，为内容生成提供结构。' },
    ] },
    { title: '成果与交付', description: '把执行成果沉淀下来，完成汇报与对外交付。', items: [
      { title: '产物管理', description: '上传文件或文件夹，预览、下载，并关联项目、任务与模板。' },
      { title: '周期报告', description: '手动或定时生成日报、周报和月报，按项目与日期归档。' },
      { title: '公开分享', description: '通过分享令牌提供无需登录的产物访问页面，并支持取消分享。' },
    ] },
  ],
  relations: [
    { from: '项目', to: '阶段与任务', description: '项目是主要的数据边界；阶段组织生命周期，任务属于项目并可归入阶段。' },
    { from: '任务', to: '产物与模板', description: '产物既属于项目，也可以进一步关联任务和模板，保留成果的来源与用途。' },
    { from: '项目资料', to: '文档与绘图', description: '文档与画布归属于项目；文档内引用同项目画布，说明文字与可编辑图形一起维护。' },
    { from: '持续编辑', to: '保存与历史', description: '文档和画布保留保存状态、本地草稿与历史版本，支持恢复已有内容。' },
    { from: '项目上下文', to: 'AI 会话', description: 'AI 会话可绑定项目，结合当前项目与模板组织内容，调用基础查询能力。' },
    { from: '项目进展', to: '报告与分享', description: '报告按项目与日期归档；产物通过独立分享令牌提供公开访问。' },
  ],
  technology: [
    { title: '前端应用', stack: 'React 19 / TypeScript / Vite', description: '承载项目工作台；文档使用 Tiptap 编辑，绘图使用 Excalidraw，支持 Mermaid 图表预览。' },
    { title: '后端服务', stack: 'Express 5 / TypeScript / Prisma', description: '提供认证、项目、任务、文档、绘图、文件、模板、报告与访问接口。' },
    { title: '数据与文件', stack: 'PostgreSQL / MinIO', description: '数据库保存项目、文档、画布及版本关系，对象存储承载图片、附件与交付文件。' },
    { title: 'AI 与定时任务', stack: 'DeepSeek / Function Calling / Cron', description: '模型结合项目上下文工作，定时任务负责按周期触发报告生成。' },
  ],
  foundations: ['账号注册与 JWT 登录', '明暗主题', '项目内容权限', '自动保存与本地草稿', '历史版本与恢复', '产物分享令牌'],
  notes: [
    { title: '当前状态', description: '项目工作台已上线，持续迭代。建设范围覆盖项目、任务、文档中心、绘图中心、产物、模板、AI 助手、报告和分享。' },
    { title: '运行依赖', description: 'PostgreSQL 为基础依赖；文件上传与预览依赖 MinIO，AI 能力依赖可用的模型配置。' },
    { title: '能力边界', description: '文档与绘图按项目权限访问，所有者编辑、项目查看者阅读；完整编辑以桌面端为主，暂不支持多人实时协作。' },
  ],
  sources: [{ label: '使用与部署文档', href: 'https://github.com/JojoShine/FlowCraft#readme' }],
})

Object.assign(productProfiles.find(profile => profile.slug === 'custom-wechat-app'), {
  ready: true,
  project: {
    github: 'https://github.com/JojoShine/custom_wechat_app',
    demo_qr_url: '/api/archive/files?path=tbtparent-me%2Fprojects%2Fdemo-qr%2F1792410159830-custom-wechat-code-20261019.jpg',
  },
  brandName: '小程序底座',
  category: '微信小程序全栈底座',
  keywords: ['微信小程序', 'Taro', 'NestJS', 'WebView', '微信支付'],
  experience: true,
  headline: '把通用能力留在底座，\n把开发重点放回业务。',
  summary: 'custom_wechat_app 是供团队按场景复制的单实例全栈工程。将微信登录、原生能力、WebView、文件和支付封装为通用模块，业务项目在此基础上构建自己的页面与服务。',
  purposeSummary: '减少基础能力的重复接入，让平台能力和具体业务各有清晰的职责。',
  constructionTitle: '从小程序界面，到服务端支撑。',
  constructionSummary: '身份与会话、原生与网页、文件与支付、工程与复用，覆盖一套小程序工程的基础链路。',
  collaborationSummary: '页面通过统一客户端调用 API，前后端共享公开契约；业务规则与平台能力分层维护。',
  technologySummary: '小程序、API 和共享契约在同一个工作区中维护，数据库与对象存储分别保存业务数据和文件。',
  resourcesSummary: '查看开发、专项接入与部署文档，了解如何将底座用于新的业务场景。',
  footerLabel: 'custom_wechat_app · 微信小程序全栈底座',
  problems: [
    { title: '基础接入反复重做', description: '每个项目都需要登录、资料、上传和支付等基础流程，重复接入增加联调与维护成本。' },
    { title: '跨端接口容易偏离', description: '小程序与服务端分别维护数据字段，业务变更时容易出现请求、响应和页面理解不一致。' },
    { title: '平台与业务混在一起', description: '把支付接入、业务订单和履约写在同一层，会让复制新场景和后续调整变得困难。' },
  ],
  construction: [
    { title: '身份与会话', icon: 'user', description: '建立小程序登录态，承接用户资料与授权流程。', items: [
      { title: '微信登录与会话', description: '封装微信登录、JWT 会话、统一 API 客户端，以及需要登录的页面回跳。' },
      { title: '用户资料', description: '支持昵称、头像和手机号绑定；手机号能力按小程序实际权限接入。' },
    ] },
    { title: '原生能力与 WebView', icon: 'phone', description: '连接微信原生能力与已登记的网页应用。', items: [
      { title: '原生能力封装', description: '提供定位、地图选点、扫码、本地媒体选择与预览、剪贴板、网络状态和设备摘要等调用。' },
      { title: '网页应用接入', description: '通过登记的网页入口、一次性票据与专用短时会话接入 WebView，保持网页和小程序身份访问范围独立。' },
      { title: '分享与页面导航', description: '内置好友分享、场景导航和登录后返回流程，页面与门户可按业务替换。' },
    ] },
    { title: '文件与支付', icon: 'payment', description: '封装文件访问和收退款流程，业务保留自己的规则。', items: [
      { title: '私有文件服务', description: '使用私有 OSS 保存上传文件，通过短期签名地址读取，配套图片上传与头像管理。' },
      { title: '微信支付与退款', description: '接入微信支付 API v3 普通直连，支持预支付、通知验签、主动查单和多次部分退款。' },
      { title: '对账与业务事件', description: '定时核对交易账单，记录差异并支持重跑；向业务模块传递支付和退款结果，由业务推进履约。' },
    ] },
    { title: '工程与复用', icon: 'engineering', description: '将客户端、服务端与交付方式一起沉淀。', items: [
      { title: '共享数据契约', description: '小程序和 API 同仓维护，共享 TypeScript 请求与响应类型，业务模块拥有独立的扩展位置。' },
      { title: '验证与容器交付', description: '配套自动测试、Docker Compose、数据库迁移文件和 CI 镜像构建；部署按明确版本执行。' },
      { title: '按场景复制', description: '为新项目替换门户、AppID、业务模块与运行配置，每个实例独立连接自己的服务与数据。' },
    ] },
  ],
  relations: [
    { from: '页面请求', to: '契约与 API', description: '小程序通过统一客户端发起请求，API 处理业务；两端通过共享包约定公开数据结构。' },
    { from: '小程序登录', to: '网页会话', description: '已登记的网页使用一次性票据兑换专用短时会话，网页会话不直接复用小程序接口权限。' },
    { from: '业务订单', to: '支付与履约', description: '业务决定价格和可购买规则，平台处理支付与通知，业务再依据可信结果完成履约。' },
    { from: '文件上传', to: '签名访问', description: '文件存入私有 OSS，服务端按访问规则提供短期签名地址，供头像和业务文件读取。' },
  ],
  technology: [
    { title: '小程序客户端', stack: 'Taro / React / TypeScript', description: '承载门户、资料页、网页应用与原生能力，当前构建目标为微信小程序。' },
    { title: 'API 服务', stack: 'NestJS / Prisma / PostgreSQL', description: '组织认证、用户、文件、支付、网页票据和日志模块，业务服务独立扩展。' },
    { title: '文件与外部服务', stack: '阿里云 OSS / 微信登录 / 微信支付 API v3', description: '分别承担私有文件存储、微信身份与收退款接入，各场景使用独立配置。' },
    { title: '工程交付', stack: 'pnpm Workspaces / Docker / GitHub Actions', description: '统一维护共享契约、测试、迁移和镜像构建，本地与服务器按指定版本运行。' },
  ],
  foundations: ['统一 API 客户端', '共享 TypeScript 契约', '分类日志与健康检查', '版本化数据库迁移', '独立业务扩展目录'],
  notes: [
    { title: '当前状态', description: '已上线微信小程序示例，底座已包含身份、原生能力、WebView、文件、支付退款与对账模块。' },
    { title: '适用范围', description: '面向按场景复制的单实例项目，当前目标是微信小程序；其他端需要单独适配，不提供多租户切换。' },
    { title: '业务边界', description: '商品、定价、业务订单、退款规则和履约由具体业务实现；底座提供通用接入与工程基础。' },
    { title: '接入条件', description: '每个场景需配置自己的小程序身份、服务端、数据库与 OSS；支付使用具备相应权限的普通直连商户，并完成域名和真机联调。' },
  ],
  sources: [
    { label: '开发与架构文档', href: 'https://github.com/JojoShine/custom_wechat_app/blob/master/docs/development-guide.md', description: '场景复制、接口契约与业务扩展' },
    { label: '部署与环境配置', href: 'https://github.com/JojoShine/custom_wechat_app/blob/master/docs/deployment.md', description: '容器运行、版本与环境准备' },
  ],
})

Object.assign(productProfiles.find(profile => profile.slug === 'custom-app'), {
  ready: true,
  project: {
    pc_url: 'https://tbtparent.me/custom-app/console/docs/overview',
    github: 'https://github.com/JojoShine/custom_app',
    demo_qr_url: '/api/archive/files?path=tbtparent-me%2Fprojects%2Fdemo-qr%2F1792511084290-custom-app-android-test-20261020.png',
  },
  logo: '/images/projects/custom-app/logo.svg',
  brandName: 'custom_app',
  category: 'Flutter App 与配套管理平台',
  keywords: ['custom_app', 'Flutter', 'App 定制', '应用接入', '运维平台', '运营平台'],
  stateLabel: 'Android 测试版',
  experience: true,
  experienceActionLabel: '体验 Android 测试版',
  experienceKicker: 'Android 公开体验',
  experienceTitle: '先体验当前的 Android 测试版。',
  experienceDescription: '使用手机扫描二维码，打开 Android 测试版入口。iOS 与鸿蒙暂未开放公开下载。',
  experienceImageAlt: 'custom_app Android 测试版入口二维码',
  experienceLinkLabel: '查看测试版二维码原图',
  headline: '复用基础能力，\n交付定制 App。',
  summary: 'custom_app 是用于定制开发和交付 App 的基础套件，由 Flutter App、业务后端，以及并列的应用接入、运维、运营三个平台组成。界面与通用能力分开维护，按具体项目选择和组合。',
  purposeSummary: '让 App 开发、第三方接入与持续运营建立在一套明确的工程基础上。',
  constructionTitle: '一个 App 底座，三个配套平台。',
  constructionSummary: 'App 承载用户体验；应用接入、运维、运营三个平台并列协作，业务后端提供共同的服务与数据支撑。',
  collaborationSummary: '原生业务可以独立开发；需要第三方网页时，再通过接入平台引入 H5。运维与运营分别维护运行配置和业务内容。',
  technologySummary: '客户端、业务后端和管理平台由三个工程分别维护，通过受控接口连接，App 用户和管理员使用各自的身份体系。',
  resourcesSummary: '查看产品介绍、定制交付流程和可选的 H5 接入规范，确认适合当前项目的建设范围。',
  footerLabel: 'custom_app · App 底座与配套平台',
  problems: [
    { title: '基础能力重复建设', description: '账号、消息、扫码、文件与定位在不同 App 中反复接入，增加开发与逐端联调成本。' },
    { title: '样式与能力相互牵制', description: '品牌和业务页面变化时，希望保留已有的账号、原生适配与服务能力，减少重复改造。' },
    { title: '交付之后仍需维护', description: 'App 上线后，应用接入、内容发布、用户反馈、版本与运行排查仍需要对应的管理入口。' },
  ],
  construction: [
    { title: 'Flutter App 底座', icon: 'phone', description: '由产品页面组合通用模块，按业务交付客户端。', items: [
      { title: '页面与品牌定制', description: '在 Flutter 工程中开发页面、导航和交互，复用共享模块；名称、图标、配色与业务内容按项目确定。' },
      { title: '账户、消息与反馈', description: '已有验证码登录、资料、认证链路、站内消息、推送联动、帮助反馈与设置等基础流程。' },
      { title: '原生与厂商适配', description: '封装扫码、拍照、相册、文件、定位和系统分享，通过适配层接入高德、友盟与阿里云认证等能力。' },
    ] },
    { title: '应用接入平台', icon: 'integration', description: '在需要第三方 H5 时，管理接入与开放范围。', items: [
      { title: '单位与应用申请', description: '管理接入单位、成员、申请草稿和材料，通过审核明确应用归属与接入信息。' },
      { title: '资料与能力授权', description: '按申请约定用户资料和原生能力的开放范围；网页通过 WebView、Bridge 和 JSSDK 调用已获授权的能力。' },
      { title: '联调、验收与发布', description: '记录平台、版本与验收材料，沿用提交、审核和发布流程，支持后续变更及上下架。' },
    ] },
    { title: '运维平台', icon: 'maintenance', description: '维护 App 的运行配置、版本与排查入口。', items: [
      { title: 'App 与应用目录', description: '维护 App 信息、应用资料、服务分类和版本服务范围，管理 Android 安装包及客户端更新配置。' },
      { title: '运行与调用排查', description: '提供服务监控、能力调用记录与日志入口，结合已配置的服务连接定位运行问题。' },
      { title: '用户与发布管理', description: '维护用户、角色、反馈及约定内容位置，按权限完成编辑、审核和发布，并保留操作记录。' },
    ] },
    { title: '运营平台', icon: 'operations', description: '围绕内容、活动、消息与效果开展日常运营。', items: [
      { title: '内容与活动', description: '提供内容、活动和素材维护入口，按既定流程组织发布，并维护参与记录等业务内容。' },
      { title: '消息与运营触达', description: '管理通知与推送任务，通过业务后端和实际接入的消息服务完成投递。' },
      { title: '运营与应用分析', description: '提供运营概览、应用使用与活动效果等分析入口，数据来自实际业务记录及已配置的统计服务。' },
    ] },
  ],
  relations: [
    { from: '产品界面', to: '共享能力', description: 'Flutter 页面负责品牌和业务交互，账号、消息及原生适配作为共享模块复用，样式变化不要求重写全部能力。' },
    { from: '第三方 H5', to: '接入平台', description: '网页业务按需申请资料和能力授权，经过联调验收后发布；纯原生 App 不必使用这条接入链路。' },
    { from: '运维配置', to: 'App 运行', description: '应用目录、服务范围和更新配置影响客户端可用入口；已约定的内容位置遵循相应审核发布流程。' },
    { from: '运营内容', to: '业务服务', description: '内容、活动与消息通过业务后端进入 App，运营平台结合业务记录和统计服务查看效果。' },
  ],
  technology: [
    { title: '客户端与能力层', stack: 'Flutter / Dart / 原生 SDK 适配', description: '产品页面、共享业务、能力契约与平台实现分层，Android、iOS 与 HarmonyOS 分别配置和验证。' },
    { title: 'App 业务后端', stack: 'NestJS / Prisma / PostgreSQL / Redis', description: '承载 App 用户、服务接入、内容与消息等业务，API 和 Worker 分别运行。' },
    { title: '管理平台', stack: 'React / Ant Design / NestJS', description: '三个平台共用管理员、角色、会话与审计基础，通过服务端受控接口访问业务后端。' },
    { title: '文件与交付', stack: '私有对象存储 / Docker / GitHub Actions', description: '保存业务文件与安装包，按版本构建客户端和后端，配套迁移、环境与发布说明。' },
  ],
  foundations: ['样式与能力解耦', 'App 与管理身份分离', '按 App 范围授权', '操作与调用记录', '逐端配置和验收'],
  notes: [
    { title: '当前体验', description: '目前仅开放 Android 测试版。iOS 与 HarmonyOS 工程按各端维护与验证，暂不提供公开下载。' },
    { title: '定制范围', description: '页面布局、导航和业务交互在 Flutter 工程中开发，随 App 版本交付；后台维护已约定的内容与配置位置。' },
    { title: '外部服务', description: '短信、认证、定位、统计和推送按项目配置厂商账号、签名及服务参数。已有集成以实际启用和真机验收为准。' },
    { title: '可选扩展', description: '第三方 H5 接入按需启用。微信开放平台能力仍需单独对接与验收，不将微信或支付宝登录支付列为当前可交付能力。' },
  ],
  sources: [
    { label: '产品介绍与定制范围', href: 'https://tbtparent.me/custom-app/console/docs/overview', description: '已有基础、适用场景与建设范围' },
    { label: '定制与交付', href: 'https://tbtparent.me/custom-app/console/docs/delivery', description: '需求、页面开发、逐端验收和交付' },
    { label: '第三方 H5 接入指南', href: 'https://tbtparent.me/custom-app/console/docs/integration', description: '按需扩展：网页授权、JSSDK 与联调' },
  ],
})
