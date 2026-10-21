export const qingwenProjectData = {
  name_zh: '轻问',
  name_en: 'Qingwen',
  description_zh: '面向各类调查问卷场景的轻量工具，将近期多个问卷项目的共性需求整合为统一产品，支持快捷建卷、自定义题目、发布收集与结果统计。',
  description_en: 'A lightweight survey tool that brings shared needs from several recent questionnaire projects into one reusable product, covering quick creation, custom questions, publishing, response collection, and results.',
  tags_zh: ['调查问卷', '自定义题目', '跨端填写', '数据收集', '结果统计'],
  tags_en: ['Surveys', 'Custom Questions', 'Cross-device Forms', 'Response Collection', 'Results'],
  deadline_zh: '已上线，持续迭代',
  deadline_en: 'Live, with ongoing improvements',
  status: 'completed',
  project_type: 'pc',
  recent_focus: false,
  content_zh: `## 做了什么

轻问是一款面向多种调查场景的快捷、自定义问卷创建与收集工具。围绕“创建问卷 → 自定义题目 → 发布收集 → 查看结果”的完整流程，让问卷从零散的项目需求，变成可以持续复用的通用产品。

轻松创建，高效收集，让每一次提问都有价值。

## 项目背景

近期多个项目都涉及调查问卷：业务场景不同，但题目配置、问卷发布、答卷收集和结果整理等需求高度相似。继续逐个开发，会反复建设同一套基础能力，也让后续维护和迭代变得分散。

因此，将这些共性需求统一整理为“轻问”，以类似问卷星的通用问卷工具为方向，让具体业务通过配置组合问卷，减少重复开发。

## 功能亮点

1. **快捷建卷**：从问卷名称和题目开始，快速建立问卷；通过拖拽调整题目顺序，让编辑流程更直观。
2. **自定义题目**：按需求组合单选、多选、填空、数字、日期、评分、排序和矩阵等题型，并配置选项与必填规则。
3. **发布与收集**：发布后通过链接或二维码分享，支持手机与电脑填写，将答卷集中保存。
4. **结果统计**：查看各题统计与原始答卷，按条件筛选结果，并导出 CSV，方便后续整理与分析。

## 适用场景

- 用户研究与产品反馈：了解使用体验、需求与建议。
- 活动反馈与满意度调查：围绕一次活动或服务收集意见。
- 企业与团队内部调研：以统一问卷整理不同角色的反馈。
- 教育与日常信息收集：按具体目的配置题目，减少临时搭建表单的工作。

## 项目价值

把多个项目中的重复需求沉淀为统一的问卷能力，让创建、发布、收集和整理遵循同一套流程。新场景可以在现有产品上持续扩展，把更多精力留给问题本身与反馈的使用。

## 项目资料

轻问已开发完成并上线，支持问卷创建、可视化编辑、发布分享、手机与电脑填写、答卷统计和 CSV 导出，并具备附件上传、条件显示、收集限制及用户权限管理能力。

- [在线体验](https://tbtparent.me/surveys/login)
- [代码仓库](https://github.com/JojoShine/qingwen)
- [使用与部署文档](https://github.com/JojoShine/qingwen#readme)`,
  content_en: `## Overview

Qingwen is a lightweight tool for creating custom questionnaires and collecting responses across survey scenarios. It connects creation, question configuration, publishing, collection, and results in one reusable product.

Create with ease, collect efficiently, and make every question count.

## Background

Several recent projects needed surveys. Their business contexts differed, but question configuration, publishing, response collection, and reporting shared the same foundations. Building each separately repeated development work and scattered maintenance.

Qingwen consolidates those shared needs into a general-purpose survey tool, taking products such as Wenjuanxing as a reference for the category. New scenarios can be addressed by configuring questionnaires rather than rebuilding the foundations.

## Highlights

1. **Quick creation**: Start with a questionnaire title and questions, then reorder questions by dragging.
2. **Custom questions**: Combine single choice, multiple choice, text, numbers, dates, ratings, ranking, and matrix questions with configurable options and required fields.
3. **Publishing and collection**: Share published questionnaires through links or QR codes, accept responses on phones and computers, and keep responses together.
4. **Results**: Review question summaries and individual responses, filter results, and export CSV files for further analysis.

## Use cases

- User research and product feedback.
- Event feedback and satisfaction surveys.
- Internal company and team questionnaires.
- Education and everyday information collection.

## Value

Turn repeated project requirements into reusable survey capabilities. A consistent creation, publishing, collection, and review workflow makes it easier to support new contexts while focusing on the questions and how their answers are used.

## Project resources

Qingwen is complete and live. It supports questionnaire creation, visual editing, publishing and sharing, mobile and desktop responses, result statistics, and CSV export, along with attachments, conditional questions, collection limits, and user permissions.

- [Try Qingwen](https://tbtparent.me/surveys/login)
- [Source code](https://github.com/JojoShine/qingwen)
- [Usage and deployment documentation](https://github.com/JojoShine/qingwen#readme)`,
}

export const qingwenCapabilities = [
  {
    title_zh: '快捷建卷', title_en: 'Quick Creation',
    description_zh: '快速新建问卷，直观编辑并调整题目顺序，减少从需求到问卷的准备工作。',
    description_en: 'Create questionnaires quickly, edit questions, and reorder them in a clear workflow.',
    icon: 'workflow',
  },
  {
    title_zh: '自定义题目', title_en: 'Custom Questions',
    description_zh: '按场景组合选择、填空、评分、日期与矩阵等题型，灵活配置选项和必填规则。',
    description_en: 'Combine choice, text, rating, date, and matrix questions with configurable options and required fields.',
    icon: 'layers',
  },
  {
    title_zh: '发布与收集', title_en: 'Publish & Collect',
    description_zh: '通过链接或二维码分享问卷，支持手机和电脑填写，将答卷集中保存。',
    description_en: 'Share questionnaires through links or QR codes and collect responses from phones and computers.',
    icon: 'mobile',
  },
  {
    title_zh: '结果统计', title_en: 'Survey Results',
    description_zh: '集中查看统计和原始答卷，筛选结果并导出 CSV，便于整理与后续分析。',
    description_en: 'Review summaries and individual responses, filter results, and export CSV files for further analysis.',
    icon: 'database',
  },
]
