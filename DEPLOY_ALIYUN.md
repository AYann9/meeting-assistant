# 阿里云函数计算部署指南

## 第一步：构建项目

在本地运行：
```bash
npm run build
```

构建完成后，`.next/standalone` 目录会包含部署所需的所有文件。

## 第二步：通过阿里云控制台部署

1. **登录阿里云函数计算控制台**
   - 访问：https://fcnext.console.aliyun.com

2. **创建服务**
   - 点击左侧"服务"
   - 点击"创建服务"
   - 名称：`meeting-assistant`
   - 区域：选择 `华东2（上海）`

3. **创建函数**
   - 在服务详情页面，点击"创建函数"
   - 选择"创建事件函数"或"创建 Web 函数"
   - 配置如下：
     - 函数名称：`nextjs-app`
     - 运行环境：`Custom Runtime (Debian 10)`
     - 内存：`2048 MB`
     - 超时时间：`120 秒`

4. **上传代码**
   - 将 `.next/standalone` 目录打包成 zip 文件
   - 在函数配置页面，选择"上传代码"
   - 上传 zip 文件

5. **配置环境变量**
   - 在函数配置页面，添加环境变量：
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://hfxxnshgrozdhrlmebbd.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Anon Key

6. **配置 Custom Runtime**
   - 在函数配置页面，找到"Custom Runtime 配置"
   - 启动命令：`node server.js`
   - 监听端口：`9000`

7. **创建 HTTP 触发器**
   - 在函数配置页面，点击"触发器"
   - 创建 HTTP 触发器
   - 认证方式：`匿名`

8. **获取访问地址**
   - 部署成功后，控制台会显示访问地址
   - 地址格式：`https://你的账号.区域.fcapp.run`

## 注意事项

- 首次部署可能需要开通函数计算服务
- 确保 RAM 用户有函数计算的完全访问权限
- 如果部署失败，检查函数日志排查问题
