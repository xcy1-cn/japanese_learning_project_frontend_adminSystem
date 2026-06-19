# Japanese Learning Platform｜Admin Frontend

`frontend-admin` 是 Japanese Learning Platform 的后台管理端，基于 Vue3、TypeScript、Element Plus、Pinia、Vue Router 和 Axios 开发。

该系统用于管理日语学习平台的核心内容数据，包括文章、句子、词汇、语法点、题目，以及句子与词汇、句子与语法点之间的关联关系。同时后台支持 Excel 批量导入功能，用于批量维护词汇、语法点和题目数据。

## 技术栈

* Vue3
* TypeScript
* Vite
* Vue Router
* Pinia
* Axios
* Element Plus
* ECharts

## 项目功能

### 登录与权限

* 管理员登录
* JWT Token 本地保存
* Axios 请求拦截器自动携带 Token
* 路由守卫
* 角色权限控制

  * `admin`：完整后台权限
  * `author`：文章、句子、词汇、语法点相关权限

### Dashboard

* 文章数量统计
* 句子数量统计
* 词汇数量统计
* 语法点数量统计
* 题目数量统计
* ECharts 数据展示

### 文章管理

* 文章列表
* 关键词搜索
* 等级筛选
* 分类筛选
* 分页查询
* 新增文章
* 编辑文章
* 删除文章
* 查看文章下的句子

### 句子管理

* 句子列表
* 根据文章 ID 筛选句子
* 新增句子
* 编辑句子
* 删除句子
* 句子排序
* 句子详情查看
* 句子关联词汇
* 取消句子词汇关联
* 句子关联语法点
* 取消句子语法点关联

### 词汇管理

* 词汇列表
* 关键词搜索
* 等级筛选
* 词性筛选
* 新增词汇
* 编辑词汇
* 删除词汇

### 语法点管理

* 语法点列表
* 关键词搜索
* 等级筛选
* 新增语法点
* 编辑语法点
* 删除语法点

### 题目管理

* 题目列表
* 题目类型筛选
* 关键词搜索
* 新增题目
* 编辑题目
* 删除题目
* 支持关联文章 ID
* 支持关联句子 ID

### Excel 批量导入

后台支持三类 Excel 数据导入：

* Vocabulary 词汇导入
* GrammarPoint 语法点导入
* Question 题目导入

页面功能包括：

* 导入类型选择
* `.xlsx` 文件上传
* Excel 模板说明
* Excel 模板下载
* 导入结果展示
* 成功数量展示
* 失败行数展示
* 错误行详情表格展示

导入结果示例：

```text
成功导入 2 条，失败 1 行
```

错误详情表格：

```text
行号 | 字段 | 错误原因
```

## 项目目录结构

```text
frontend-admin
├── public
│   └── templates
│       ├── vocabulary-template.xlsx
│       ├── grammar-point-template.xlsx
│       └── question-template.xlsx
├── src
│   ├── api
│   │   ├── auth.ts
│   │   ├── request.ts
│   │   ├── import.ts
│   │   └── ...
│   ├── router
│   │   └── index.ts
│   ├── stores
│   ├── views
│   │   ├── login
│   │   ├── layout
│   │   ├── dashboard
│   │   ├── article
│   │   ├── sentence
│   │   ├── vocabulary
│   │   ├── grammar-point
│   │   ├── question
│   │   └── import
│   ├── App.vue
│   └── main.ts
├── package.json
└── README.md
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:5251/api
```

如果后端运行在局域网其他电脑上，可以改为：

```env
VITE_API_BASE_URL=http://后端电脑IP:5251/api
```

例如：

```env
VITE_API_BASE_URL=http://192.168.1.107:5251/api
```

## 安装依赖

```bash
pnpm install
```

或：

```bash
npm install
```

## 启动项目

```bash
pnpm dev
```

或：

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

## 后端接口依赖

后台管理端依赖 ASP.NET Core Web API 后端服务。

默认后端地址：

```text
http://localhost:5251/api
```

主要接口模块：

```text
/api/Auth
/api/Article
/api/Sentence
/api/Vocabulary
/api/GrammarPoint
/api/Question
/api/Import
```

## Excel 导入说明

### Vocabulary 模板

```text
Word | Reading | Meaning | PartOfSpeech | Level
```

### GrammarPoint 模板

```text
Title | Explanation | Structure | Example | Level
```

### Question 模板

```text
ArticleId | SentenceId | Type | Stem | OptionA | OptionB | OptionC | OptionD | Answer | Explanation | Level
```

上传接口：

```http
POST /api/Import/vocabularies
POST /api/Import/grammar-points
POST /api/Import/questions
```

上传格式：

```text
Content-Type: multipart/form-data
form-data key: file
file type: .xlsx
```

## 核心实现点

### 1. Axios 统一封装

项目通过 Axios 请求拦截器统一携带 JWT Token：

```text
Authorization: Bearer token
```

响应拦截器统一返回后端 `ApiResponse<T>` 结构，前端页面可以统一读取：

```ts
res.data
```

### 2. 路由守卫

后台页面需要登录后访问。未登录用户访问后台页面时，会自动跳转到登录页。

### 3. Excel 上传控制

Excel 上传使用 Element Plus `el-upload`，并设置：

```vue
:auto-upload="false"
```

这样可以让用户先选择导入类型，再点击“开始导入”按钮手动提交。

### 4. FormData 文件上传

Excel 文件通过 `FormData` 提交：

```ts
const formData = new FormData();
formData.append("file", file);
```

其中 `file` 必须与后端 `IFormFile file` 参数名一致。

### 5. 模板下载

模板 Excel 文件放在：

```text
public/templates
```

Vite 会将 `public` 目录直接映射为网站根路径。

例如：

```text
public/templates/vocabulary-template.xlsx
```

访问路径为：

```text
/templates/vocabulary-template.xlsx
```

## 项目亮点

* 完整后台内容管理系统
* Vue3 + TypeScript 前端工程化实践
* Element Plus 表格、表单、上传组件综合使用
* JWT 登录鉴权与路由守卫
* Axios 请求/响应统一封装
* 文章、句子、词汇、语法点、题目 CRUD
* 句子与词汇、语法点多对多关联管理
* Excel 批量导入页面
* Excel 模板下载
* 导入错误行可视化展示
* Dashboard 数据统计与图表展示

## 后续优化计划

* 增加更细粒度的角色权限控制
* 增加导入历史记录页面
* 增加 Excel 导入进度条
* 增加大文件上传提示
* 增加更多表单校验规则
* 优化移动端适配
* 增加单元测试和组件测试
* 与后端导入日志表联动
