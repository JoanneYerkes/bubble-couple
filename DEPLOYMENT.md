# Dokploy 部署指南 / Dokploy Deployment Guide

这个文档介绍如何将 Bubble Couple 应用部署到 Dokploy 平台。

This document describes how to deploy the Bubble Couple app to Dokploy platform.

## 前置要求 / Prerequisites

- Dokploy 账号和已安装的 Dokploy 实例
- Git 仓库访问权限
- Docker 支持（Dokploy 已内置）

## 部署步骤 / Deployment Steps

### 方法 1：通过 Dokploy UI 部署 / Method 1: Deploy via Dokploy UI

1. **登录 Dokploy 控制台**
   - 访问你的 Dokploy 实例
   - 登录到控制台

2. **创建新应用 / Create New Application**
   - 点击 "Create Application" 或 "新建应用"
   - 选择 "Docker Compose" 或 "Dockerfile" 部署方式

3. **配置 Git 仓库 / Configure Git Repository**
   - Repository URL: `https://github.com/JoanneYerkes/bubble-couple.git`
   - Branch: `main` (或你想部署的分支)
   - Build Method: Dockerfile

4. **配置构建设置 / Configure Build Settings**
   - Dockerfile Path: `./Dockerfile`
   - Context Path: `./`
   - Port: `80` (容器内部端口)

5. **配置域名和端口映射 / Configure Domain and Port Mapping**
   - External Port: `3000` (或你想要的端口)
   - 可选：配置自定义域名

6. **环境变量 / Environment Variables**
   - 如果需要 Gemini API Key，添加：
     - `GEMINI_API_KEY`: 你的 API key

7. **部署 / Deploy**
   - 点击 "Deploy" 开始部署
   - 等待构建完成（通常需要几分钟）

### 方法 2：使用 Docker Compose 部署 / Method 2: Deploy with Docker Compose

1. **在 Dokploy 中选择 Docker Compose 方式**
   - 上传或粘贴 `docker-compose.yml` 文件内容

2. **配置仓库信息**
   - Repository: `https://github.com/JoanneYerkes/bubble-couple.git`
   - Branch: `main`

3. **点击部署**
   - Dokploy 会自动拉取代码
   - 使用 docker-compose.yml 进行部署

### 本地测试 Docker / Local Docker Testing

在部署到 Dokploy 之前，可以在本地测试 Docker 构建：

```bash
# 构建镜像
docker build -t bubble-couple .

# 运行容器
docker run -p 3000:80 bubble-couple

# 或使用 docker-compose
docker-compose up
```

访问 `http://localhost:3000` 查看应用。

## 项目结构 / Project Structure

```
.
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf             # Nginx 配置文件
├── .dockerignore          # Docker 忽略文件
└── ...其他应用文件
```

## Docker 构建说明 / Docker Build Details

这个项目使用多阶段构建：

1. **构建阶段**：使用 Node.js 构建 Vite 应用
2. **生产阶段**：使用 Nginx 服务静态文件

优势：
- ✅ 镜像体积小（只包含构建产物）
- ✅ 生产环境优化
- ✅ 快速启动
- ✅ 安全性高

## 端口配置 / Port Configuration

- **容器内部端口**：80 (Nginx)
- **外部映射端口**：3000 (可自定义)

## 故障排查 / Troubleshooting

### 构建失败 / Build Fails

1. 检查 Node.js 版本是否兼容
2. 确保所有依赖都在 package.json 中声明
3. 查看 Dokploy 构建日志

### 应用无法访问 / Application Not Accessible

1. 检查端口映射是否正确
2. 确认防火墙规则
3. 检查 Nginx 日志

### 查看日志 / View Logs

在 Dokploy 控制台中：
- 进入应用详情页
- 点击 "Logs" 或"日志"标签
- 查看实时日志输出

## 更新部署 / Update Deployment

1. 推送代码到 Git 仓库
2. 在 Dokploy 中触发重新部署
3. 或者配置自动部署（Webhook）

## 性能优化 / Performance Optimization

已包含的优化：
- ✅ Gzip 压缩
- ✅ 静态资源缓存
- ✅ 最小化镜像大小
- ✅ 多阶段构建

## 安全建议 / Security Recommendations

- 🔒 不要在代码中硬编码敏感信息
- 🔒 使用 Dokploy 的环境变量管理功能
- 🔒 定期更新依赖包
- 🔒 配置 HTTPS（通过 Dokploy 或反向代理）

## 支持 / Support

如有问题，请：
1. 查看 [Dokploy 文档](https://docs.dokploy.com)
2. 检查本项目的 GitHub Issues
3. 查看容器日志进行调试
