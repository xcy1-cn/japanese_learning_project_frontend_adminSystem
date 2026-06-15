# Japanese Learning Admin Frontend

## 项目简介

Japanese Learning Admin Frontend 是一个基于 Vue3 + TypeScript + Element Plus 开发的日语学习平台后台管理系统。

该后台用于管理日语学习平台中的核心学习数据，包括文章、句子、词汇、语法点和题目。前端通过 Axios 调用 ASP.NET Core Web API 后端接口，并使用 JWT Token 完成后台管理端的登录鉴权。

当前项目已完成后台管理系统第一版核心 CRUD 闭环。

---

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Element Plus
- Sass
- normalize.css

---

## 后端技术栈

本项目对应后端为：

- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- JWT Authentication
- RESTful API
- Swagger API Docs

---

## 项目功能

### 1. 登录与鉴权

- 管理员登录
- JWT Token 存储
- Axios 请求拦截器自动携带 Token
- 路由守卫
- 未登录自动跳转登录页
- 退出登录清理本地登录信息

### 2. 文章管理

- 文章列表
- 关键词搜索
- 等级筛选
- 分类筛选
- 分页
- 新增文章
- 编辑文章
- 删除文章
- 进入文章下句子管理

### 3. 文章下句子管理

- 查看指定文章下的句子
- 按句子顺序展示
- 新增句子
- 编辑句子
- 删除句子
- 返回文章管理

说明：句子解析功能目前暂时不做。

### 4. 全局句子管理

- 查看全部句子
- 按关键词搜索
- 按文章 ID 筛选
- 分页
- 新增句子
- 编辑句子
- 删除句子

### 5. 词汇管理

- 词汇列表
- 按单词 / 读音 / 含义搜索
- 按等级筛选
- 按词性筛选
- 分页
- 新增词汇
- 编辑词汇
- 删除词汇

### 6. 语法管理

- 语法点列表
- 按关键词搜索
- 按等级筛选
- 分页
- 新增语法点
- 编辑语法点
- 删除语法点

### 7. 题目管理

- 题目列表
- 按题型筛选
- 按关键词搜索
- 分页
- 新增题目
- 编辑题目
- 删除题目

---

## 数据展示命名规范

为方便后台表格阅读，前端表格中统一使用以下简写：

| 数据字段 | 前端显示 |
|---|---|
| Article Id / ArticleId | AID |
| Sentence Id / SentenceId | SID |
| Vocabulary Id | VID |
| GrammarPoint Id | GID |
| Question Id | QID |

注意：后端接口字段名仍然保持原始命名，例如 `articleId`、`sentenceId`、`id`，这里只修改前端表格显示文案。

---

## 项目目录结构

```txt
src
├── api
│   ├── request.ts
│   ├── auth.ts
│   ├── article.ts
│   ├── sentence.ts
│   ├── vocabulary.ts
│   ├── grammar.ts
│   └── question.ts
│
├── router
│   └── index.ts
│
├── views
│   ├── login
│   │   └── LoginView.vue
│   ├── layout
│   │   └── AdminLayout.vue
│   ├── dashboard
│   │   └── DashboardView.vue
│   ├── article
│   │   ├── ArticleListView.vue
│   │   └── ArticleSentenceView.vue
│   ├── sentence
│   │   └── SentenceListView.vue
│   ├── vocabulary
│   │   └── VocabularyListView.vue
│   ├── grammar
│   │   └── GrammarListView.vue
│   └── question
│       └── QuestionListView.vue
│
├── styles
│   └── index.scss
│
├── App.vue
└── main.ts