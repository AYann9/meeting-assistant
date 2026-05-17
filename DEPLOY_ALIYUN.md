# 阿里云函数计算部署指南

## 前置准备

### 1. 注册阿里云账号
- 访问：https://www.aliyun.com
- 注册并实名认证

### 2. 开通函数计算服务
- 访问：https://fcnext.console.aliyun.com
- 点击"开通函数计算"

### 3. 获取 AccessKey
- 访问：https://ram.console.aliyun.com/manage/ak
- 创建 RAM 用户并获取 AccessKey ID 和 AccessKey Secret

### 4. 安装 Serverless Devs 工具
```bash
# 使用 npm 安装（需要 Node.js）
npm install -g @serverless-devs/s

# 或者使用 pip 安装
pip install serverless-devs

# 验证安装
s --version
```

## 配置阿里云凭证

```bash
# 配置阿里云凭证
s config add

# 选择阿里云，输入：
# - AccessKey ID
# - AccessKey Secret
# - 选择默认配置
```

## 修改配置文件

打开 `s.yaml`，根据你的需求修改以下配置：

```yaml
vars:
  region: cn-shanghai  # 修改为你的区域，可选：cn-beijing, cn-shanghai, cn-hangzhou, cn-shenzhen 等
```

## 部署步骤

### 1. 安装依赖并构建
```bash
# 进入项目目录
cd 视频会议助手

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 部署到阿里云
```bash
# 部署（首次部署需要创建资源）
s deploy

# 如果需要更新环境变量，可以这样部署：
s deploy --env NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co --env NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 查看部署结果
部署成功后，命令行会显示访问地址，类似：
```
https://your-account.cn-shanghai.fcapp.run
```

## 常见问题

### 1. 部署失败：权限不足
确保 RAM 用户有以下权限：
- AliyunFCFullAccess（函数计算完全访问权限）
- AliyunLogFullAccess（日志服务完全访问权限）

### 2. 部署失败：超时
增加函数超时时间，修改 `s.yaml` 中的 `timeout` 值（最大 600 秒）

### 3. 访问 404
检查 Next.js 的 `output: 'standalone'` 配置是否正确，确保构建了 `.next/standalone` 目录

## 删除服务

```bash
# 删除部署的服务
s remove
```
