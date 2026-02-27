# 猫域 (NEKO) - 渐进式 Web 应用 (PWA) 前端

![Angular](https://img.shields.io/badge/Angular-21.0.0-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Supported-673AB7?style=for-the-badge&logo=pwa)

**猫域 (NEKO)** 是一款基于 Angular 21 构建的高性能、现代化的 Xboard 前端面板。它不仅提供了丝滑的用户交互体验，还集成了 PWA 技术，支持离线访问与桌面安装，旨在为用户提供原生 App 级别的操作感。

---

## ✨ 核心特性

- **🚀 极致性能**: 基于 **Angular 21** 开发，采用 **Zoneless** 无区化变更检测与 **Signals** 响应式状态管理，确保 UI 响应零延迟。
- **📱 PWA 支持**: 支持渐进式 Web 应用特性。用户可将其“安装”到手机桌面或电脑任务栏，支持离线缓存，弱网环境下依然秒开。
- **🛡️ 工业级安全**: 
  - 集成 **CSP (内容安全策略)**，有效防止 XSS 攻击与脚本劫持。
  - **资源本地化**: 核心第三方库（Markdown-it, Chart.js 等）全部打包进本地，不依赖外部 CDN，确保在特殊网络环境下依然稳定。
- **🎨 现代设计**: 采用 **Tailwind CSS 4.0** 打造的暗黑系极简 UI，适配各种屏幕尺寸。
- **📊 实时数据**: 动态流量图表展示，实时订阅状态监控。
- **🛠️ 易于部署**: 支持 Docker 一键部署，内置 Nginx 优化配置。

---

## 🛠️ 技术栈

- **框架**: Angular 21 (Zoneless + Signals)
- **样式**: Tailwind CSS 4.0
- **图表**: Chart.js
- **解析**: Markdown-it
- **构建**: Angular CLI (Vite + Esbuild)
- **服务器**: Nginx (Docker)

---

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) (v20.0.0+)
- [npm](https://www.npmjs.com/) (v10.0.0+)

### 安装依赖

```bash
git clone https://github.com/your-username/neko-frontend.git
cd neko-frontend
npm install
```

### 本地开发

```bash
npm start
```
访问 `http://localhost:3000` 即可预览。

### 生产构建

```bash
npm run build
```
构建产物将存放在 `dist/` 目录下。

---

## 📦 部署说明

### 环境变量配置

在部署前，请确保配置好相关的环境变量（如 API 地址）。详细配置请参考 `.env.example`。

### 部署方式

本项目推荐使用 Docker 进行部署。我们提供了详细的部署文档：

👉 [**查看详细部署指南 (ULTIMATE_DEPLOYMENT_GUIDE.md)**](./ULTIMATE_DEPLOYMENT_GUIDE.md)

---


## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

⚠️ 免责声明：
本项目仅供编程学习与技术研究使用。请勿将其用于任何非法用途。用户在使用本项目搭建站点时，需自行承担资源版权及合规性责任，作者不承担因用户违规使用而产生的任何法律责任。
