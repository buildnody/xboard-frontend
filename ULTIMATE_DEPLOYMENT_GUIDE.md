# 猫域 (NEKO) 终极部署与迁移指南 (Docker + 手动版)

本指南旨在帮助你将“猫域 (NEKO)”项目高效地部署到任何服务器（推荐日本 VPS），并支持在多台服务器间快速迁移。

---

## 目录
1. [方案选择：手动 vs Docker](#方案选择手动-vs-docker)
2. [基础准备工作](#1-基础准备工作)
3. [本地打包与资源优化](#2-本地打包与资源优化)
4. [方案 A：手动 Nginx 部署 (适合单机)](#方案-a手动-nginx-部署-适合单机)
5. [方案 B：Docker 镜像部署 (适合频繁迁移)](#方案-b-docker-镜像部署-适合频繁迁移)
6. [开启 HTTPS (SSL) 加密](#6-开启-https-ssl-加密)
7. [常见问题与维护](#7-常见问题与维护)

---

## 方案选择：手动 vs Docker

| 特性 | 手动 Nginx 部署 | Docker 镜像部署 |
| :--- | :--- | :--- |
| **适用场景** | 长期固定一台服务器 | 需要频繁更换服务器、多机备份 |
| **迁移难度** | 较高（需重新配置环境） | 极低（一行命令恢复全环境） |
| **环境隔离** | 共享系统环境 | 独立容器，互不干扰 |
| **推荐指数** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 1. 基础准备工作

*   **服务器**: 推荐 Ubuntu 22.04 LTS (东京/大阪节点)。
*   **域名**: 已解析 A 记录到服务器 IP。
*   **本地环境**: 已安装 Node.js (v18+) 和 Docker (若选方案 B)。
*   **安全性**: 本版本已集成 **CSP (内容安全策略)**，仅允许加载受信任的资源，极大提升了防劫持能力。

---

## 2. 本地打包与资源优化

本版本已实现 **“资源本地化”**，不再依赖外部 CDN 加载核心库（如 Markdown 解析、图表等）：

1.  **自动打包**: 构建时，系统会自动从 `node_modules` 复制 `markdown-it`、`Chart.js` 等库到 `dist/assets`。
2.  **执行构建**:
    ```bash
    npm install
    npm run build
    ```
    构建完成后，确认生成了 `dist/assets/js` 和 `dist/assets/css` 文件夹。
3.  **PWA 图标**: 请确保在 `public/assets/icons/` 目录下放置您的 Logo 图标，否则 PWA 安装按钮可能不会显示。

---

## 方案 A：手动 Nginx 部署 (适合单机)

### A.1 服务器初始化
```bash
ssh root@你的服务器IP
apt update && apt upgrade -y
apt install -y nginx
```

### A.2 上传文件
在**本地电脑**运行：
```bash
scp -r ./dist/app/browser/* root@你的服务器IP:/var/www/neko/
```

### A.3 配置 Nginx
1.  创建配置：`sudo nano /etc/nginx/sites-available/neko`
2.  粘贴配置（参考项目中的 `nginx.docker.conf` 内容，但需修改 `server_name`）。
3.  保存退出：`Ctrl+O` -> `Enter` -> `Ctrl+X`。
4.  启用并重启：
    ```bash
    sudo ln -s /etc/nginx/sites-available/neko /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## 方案 B：Docker 镜像部署 (适合频繁迁移)

这是最推荐的方案。我们将整个环境（网页文件 + Nginx 配置）打包成一个“集装箱”。

### B.1 本地构建 Docker 镜像
在项目根目录下（确保已有 `Dockerfile` 和 `nginx.docker.conf`）运行：
```bash
# 构建镜像并命名为 neko-app
docker build -t neko-app .
```

### B.2 导出镜像 (用于迁移)
如果你想把这个镜像带到另一台服务器：
```bash
docker save neko-app > neko-app.tar
```

### B.3 在新服务器部署
1.  **上传镜像包**: `scp neko-app.tar root@新服务器IP:/root/`
2.  **在新服务器安装 Docker**:
    ```bash
    curl -fsSL https://get.docker.com | bash
    ```
3.  **加载并运行**:
    ```bash
    # 加载镜像
    docker load < /root/neko-app.tar
    
    # 启动容器 (将容器 80 端口映射到服务器 80)
    docker run -d --name neko -p 80:80 neko-app
    ```

---

## 6. 开启 HTTPS (SSL) 加密

无论哪种方案，建议在宿主机（服务器本身）配置 SSL。

```bash
apt install -y python3-certbot-nginx
certbot --nginx -d 你的域名
```
*   **注意**: 如果使用 Docker，Certbot 会自动识别并修改宿主机的 Nginx 转发规则（如果宿主机也装了 Nginx 作为前置代理），或者您可以直接在宿主机装个 Nginx 只做 SSL 卸载。

---

## 7. 常见问题与维护

### 7.1 权限修复
```bash
sudo chown -R www-data:www-data /var/www/neko
sudo chmod -R 755 /var/www/neko
```

### 7.2 容器日志查看 (Docker 方案)
```bash
docker logs -f neko
```

### 7.3 快速迁移 Checklist
1.  在新服务器安装 Docker。
2.  上传并 `docker load` 镜像包。
3.  `docker run` 启动。
4.  解析域名并运行 `certbot`。

---
**本指南为您提供了从零开始到自动化迁移的完整方案。建议优先尝试 Docker 方案以获得最佳的迁移体验。**
