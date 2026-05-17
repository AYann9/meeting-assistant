# 视频会议助手

一个基于 Next.js 14 的智能视频会议管理工具，支持会议管理、AI 纪要生成、待办事项分发等功能。

## 功能特性

- **会议管理**：创建、编辑、删除会议，支持多种会议类型
- **会前准备**：AI 生成会前简报、议程辅助生成、材料管理
- **会后处理**：录音转录、AI 纪要生成、待办事项提取与分发
- **知识库**：所有纪要全文检索，支持自然语言搜索
- **个人设置**：会议统计、隐私设置、外部工具集成配置

## 技术栈

- **前端框架**：Next.js 14 (App Router) + React 18
- **样式**：Tailwind CSS + shadcn/ui
- **认证**：Supabase Auth + Google OAuth
- **数据库**：Supabase PostgreSQL
- **类型系统**：TypeScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并填入你的 Supabase 配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

本项目推荐使用 [Vercel](https://vercel.com) 进行部署。

1. Fork 或克隆此仓库到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
4. 点击部署

详细部署指南请参考项目文档。

## 数据库设置

在 Supabase 中运行以下迁移文件：

- `supabase/migrations/20240101000001_initial_schema.sql`
- `supabase/migrations/20240101000002_rls_policies.sql`

## 许可证

MIT
