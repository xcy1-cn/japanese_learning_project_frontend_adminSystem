# Japanese Learning Admin Frontend

## 项目简介

Japanese Learning Admin Frontend 是一个基于 **Vue3 + TypeScript + Element Plus** 开发的日语学习平台后台管理系统。

该后台系统用于管理日语学习平台中的核心学习内容，包括文章、句子、词汇、语法点和题目。前端通过 Axios 调用 ASP.NET Core Web API 后端接口，并使用 JWT Token 实现后台登录鉴权。

当前项目已经完成后台管理端的主要功能闭环，包括：

* 登录鉴权
* 角色权限控制
* Dashboard 数据统计
* 文章管理
* 句子管理
* 词汇管理
* 语法管理
* 题目管理
* 句子与词汇 / 语法点的多对多关联管理

---

## 技术栈

### 前端

* Vue 3
* TypeScript
* Vite
* Vue Router
* Axios
* Element Plus
* ECharts
* vue-echarts
* Sass
* normalize.css

### 后端

本项目对应后端为：

* ASP.NET Core Web API
* Entity Framework Core
* MySQL
* JWT Authentication
* RESTful API
* Swagger API Docs

---

## 核心功能

### 1. 登录与鉴权

* 管理员登录
* JWT Token 存储
* Axios 请求拦截器自动携带 Token
* 路由守卫
* 未登录自动跳转登录页
* 已登录访问登录页自动跳转 Dashboard
* 退出登录清理本地登录信息

登录成功后，前端会保存：

```txt
admin_token
admin_username
admin_role
```

---

### 2. 角色权限控制

系统根据登录接口返回的 `role` 控制后台菜单和路由访问权限。

当前角色划分：

```txt
admin
- 拥有最高权限
- 可访问和操作全部功能

author
- 可访问文章、句子、词汇、语法相关功能
- 不可访问题目管理
```

前端权限控制包括：

* 菜单级权限控制
* 路由级权限控制
* 登录 role 统一小写处理
* 无权限访问时自动跳转 Dashboard

说明：前端权限用于控制页面访问体验，真正的接口安全仍需要后端通过 `[Authorize(Roles = "...")]` 进行限制。

---

### 3. Axios 请求封装

项目使用统一的 `request.ts` 封装 Axios。

已实现：

* 统一 baseURL
* 请求自动携带 JWT Token
* 401 登录失效处理
* 403 权限不足提示
* 404 资源不存在提示
* 500 服务器异常提示
* 请求超时提示
* 后端未启动 / 网络异常提示

当前环境变量配置：

```env
VITE_API_BASE_URL=http://localhost:5251/api
```

注意：因为 `baseURL` 已经包含 `/api`，所以前端接口请求中不再重复写 `/api`。

正确示例：

```ts
request.get("/Article");
request.post("/Auth/login", data);
request.get("/Sentence");
request.get("/Vocabulary");
```

错误示例：

```ts
request.get("/api/Article");
request.post("/api/Auth/login", data);
```

---

### 4. Dashboard 数据统计

Dashboard 首页使用 ECharts 展示后台数据概览。

当前统计内容：

* 文章数量
* 句子数量
* 词汇数量
* 语法点数量
* 题目数量

当前实现方式：

```txt
GET /Article?page=1&pageSize=1
GET /Sentence?page=1&pageSize=1
GET /Vocabulary?page=1&pageSize=1
GET /GrammarPoint?page=1&pageSize=1
GET /Question?page=1&pageSize=1
```

通过分页接口返回的 `total` 字段获取各模块数据总量。

Dashboard 包含：

* 统计卡片
* ECharts 柱状图
* 刷新数据按钮

---

## 业务功能模块

### 1. 文章管理 Article

功能：

* 文章列表
* 关键词搜索
* 等级筛选
* 分类筛选
* 分页
* 新增文章
* 编辑文章
* 删除文章
* 进入文章下句子管理

接口：

```txt
GET    /Article
GET    /Article/{id}
POST   /Article
PUT    /Article/{id}
DELETE /Article/{id}
GET    /Article/{id}/sentences
```

---

### 2. 文章下句子管理 Article -> Sentence

功能：

* 查看指定文章下的句子
* 按 `orderIndex` 展示句子顺序
* 新增句子
* 编辑句子
* 删除句子
* 返回文章管理
* 关联词汇
* 关联语法

说明：

文章下句子管理主要用于在文章上下文中维护句子内容，以及处理句子与词汇、语法点之间的关联关系。

---

### 3. 全局句子管理 Sentence

功能：

* 查看全部句子
* 按关键词搜索
* 按 AID 筛选
* 分页
* 新增句子
* 编辑句子
* 删除句子

接口：

```txt
GET    /Sentence
GET    /Sentence/{id}
GET    /Sentence/{id}/detail
POST   /Sentence
PUT    /Sentence/{id}
DELETE /Sentence/{id}
```

---

### 4. 词汇管理 Vocabulary

功能：

* 词汇列表
* 按单词 / 读音 / 含义搜索
* 按等级筛选
* 按词性筛选
* 分页
* 新增词汇
* 编辑词汇
* 删除词汇

接口：

```txt
GET    /Vocabulary
GET    /Vocabulary/{id}
POST   /Vocabulary
PUT    /Vocabulary/{id}
DELETE /Vocabulary/{id}
```

字段：

```txt
id
word
reading
meaning
partOfSpeech
exampleSentence
level
createdAt
```

---

### 5. 语法管理 GrammarPoint

功能：

* 语法点列表
* 按关键词搜索
* 按等级筛选
* 分页
* 新增语法点
* 编辑语法点
* 删除语法点

接口：

```txt
GET    /GrammarPoint
GET    /GrammarPoint/{id}
POST   /GrammarPoint
PUT    /GrammarPoint/{id}
DELETE /GrammarPoint/{id}
```

字段：

```txt
id
title
explanation
structure
example
level
createdAt
```

---

### 6. 题目管理 Question

功能：

* 题目列表
* 按题型筛选
* 按关键词搜索
* 分页
* 新增题目
* 编辑题目
* 删除题目

接口：

```txt
GET    /Question
GET    /Question/{id}
POST   /Question
PUT    /Question/{id}
DELETE /Question/{id}
```

字段：

```txt
id
articleId
sentenceId
type
stem
optionA
optionB
optionC
optionD
answer
explanation
level
createdAt
```

当前题目管理仅 admin 可访问。

---

### 7. 句子关联词汇 / 语法点

当前系统支持句子与词汇、语法点之间的多对多关系管理。

数据库关系：

```txt
Sentences N - N Vocabularies
Sentences N - N GrammarPoints
```

中间表：

```txt
SentenceVocabularies
- SentenceId
- VocabularyId

SentenceGrammarPoints
- SentenceId
- GrammarPointId
```

关联词汇接口：

```txt
POST   /Sentence/{sentenceId}/vocabularies/{vocabularyId}
DELETE /Sentence/{sentenceId}/vocabularies/{vocabularyId}
```

关联语法接口：

```txt
POST   /Sentence/{sentenceId}/grammar-points/{grammarPointId}
DELETE /Sentence/{sentenceId}/grammar-points/{grammarPointId}
```

句子详情接口：

```txt
GET /Sentence/{id}/detail
```

该接口用于返回当前句子的详情，以及已关联的词汇和语法点。

前端功能：

* 查看当前句子的已关联词汇
* 查看当前句子的已关联语法
* 从可关联词汇列表中添加关联
* 从可关联语法列表中添加关联
* 移除已关联词汇
* 移除已关联语法
* 已关联项目会自动从可关联列表中剔除

---

## 数据展示命名规范

为方便后台表格阅读，前端表格中统一使用以下简写：

| 数据字段                             | 前端显示 |
| -------------------------------- | ---- |
| Article Id / ArticleId           | AID  |
| Sentence Id / SentenceId         | SID  |
| Vocabulary Id / VocabularyId     | VID  |
| GrammarPoint Id / GrammarPointId | GID  |
| Question Id / QuestionId         | QID  |

注意：后端接口字段名仍然保持原始命名，例如 `articleId`、`sentenceId`、`id`。这里只修改前端表格显示文案。

---

## 项目目录结构

```txt
src
├── api
│   ├── request.ts
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── article.ts
│   ├── sentence.ts
│   ├── vocabulary.ts
│   ├── grammar.ts
│   └── question.ts
│
├── config
│   └── permission.ts
│
├── router
│   └── index.ts
│
├── views
│   ├── login
│   │   └── LoginView.vue
│   │
│   ├── layout
│   │   └── AdminLayout.vue
│   │
│   ├── dashboard
│   │   └── DashboardView.vue
│   │
│   ├── article
│   │   ├── ArticleListView.vue
│   │   └── ArticleSentenceView.vue
│   │
│   ├── sentence
│   │   └── SentenceListView.vue
│   │
│   ├── vocabulary
│   │   └── VocabularyListView.vue
│   │
│   ├── grammar
│   │   └── GrammarListView.vue
│   │
│   └── question
│       └── QuestionListView.vue
│
├── styles
│   └── index.scss
│
├── App.vue
└── main.ts
```

---

## 环境变量配置

在项目根目录创建 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:5251/api
```

说明：

当前 `VITE_API_BASE_URL` 已经包含 `/api`，所以前端 API 请求路径中不需要再重复写 `/api`。

---

## 安装依赖

```bash
pnpm install
```

或者：

```bash
npm install
```

---

## 启动项目

```bash
pnpm dev
```

或者：

```bash
npm run dev
```

默认访问地址：

```txt
http://localhost:5173
```

---

## 打包项目

```bash
pnpm build
```

或者：

```bash
npm run build
```

---

## 登录账号

开发测试账号示例：

```txt
username: admin
password: 123456
role: admin
```

```txt
username: author
password: 123456
role: author
```

具体账号以数据库 `AdminUsers` 表为准。

---

## 数据库结构概览

当前数据库核心表：

```txt
AdminUsers
Articles
Sentences
Vocabularies
GrammarPoints
Questions
SentenceVocabularies
SentenceGrammarPoints
__EFMigrationsHistory
```

核心关系：

```txt
Articles 1 - N Sentences
Articles 1 - N Questions
Sentences 1 - N Questions
Sentences N - N Vocabularies
Sentences N - N GrammarPoints
```

---

## 当前完成状态

```txt
已完成：
- 登录功能
- 退出功能
- JWT Token 管理
- Axios 请求封装
- 全局错误处理
- 路由守卫
- role 权限控制
- 后台 Layout
- Dashboard 数据统计
- ECharts 图表展示
- 文章管理 CRUD
- 文章下句子管理 CRUD
- 全局句子管理 CRUD
- 词汇管理 CRUD
- 语法管理 CRUD
- 题目管理 CRUD
- 句子关联词汇
- 句子关联语法
- 句子移除词汇关联
- 句子移除语法关联
```

---

## 项目亮点

### 1. 前后端分离架构

前端 Vue3 管理后台调用 ASP.NET Core Web API，实现完整后台管理系统。

### 2. JWT 登录鉴权

登录后保存 Token，请求拦截器自动添加：

```txt
Authorization: Bearer token
```

### 3. 基于角色的权限控制

根据后端返回的 `role` 控制菜单和路由访问。

当前支持：

```txt
admin
author
```

### 4. RESTful CRUD

文章、句子、词汇、语法点、题目均使用标准 RESTful 接口完成增删改查。

### 5. 多表关系管理

支持句子与词汇、句子与语法点之间的多对多关联关系管理。

### 6. Dashboard 数据可视化

使用 ECharts 展示文章、句子、词汇、语法点、题目数量统计。

### 7. TypeScript 类型约束

API 请求参数、响应结果、业务实体均定义 TypeScript 类型，提高代码可维护性。

### 8. 统一错误处理

Axios 响应拦截器统一处理：

```txt
401
403
404
500
请求超时
后端未启动
```
