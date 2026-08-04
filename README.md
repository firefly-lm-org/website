# Firefly LM 官网 v5 — 简约清爽版（修复增强版）

## v5 相比 v4 的修复

| 问题 | v4 | v5 |
|------|----|----|
| 缺失 workspace.html | 登录后 404 | 新增完整工作台（8 个功能面板） |
| api.js 仅 2 个函数 | 登录+注册 | 补全 12 个 API 函数 |
| 端口不匹配 | 8000 | 修正为 8080（匹配实际服务端） |
| 隐私文案误导 | 仅说"数据不出域" | 按三种模式分别说明 |
| 页脚无 ICP | 缺失 | 添加 ICP 备案占位链接 |
| 无 favicon | 无 | SVG emoji favicon |
| 无 SEO | 无 | 添加 description + keywords |

## 文件结构

```
firefly-website-v5/
├── index.html       # 首页（导航 + Hero + 工作流 + 场景 + CTA + 页脚 + 弹窗）
├── workspace.html   # 工作台（8 个面板：数据/种子/训练/聚合/下载/聊天/积分/审计）
├── style.css        # 全部样式（CSS 变量 + 模块化 + 工作台样式）
├── api.js           # 弹窗逻辑 + 12 个 API 封装 + Token 管理
└── README.md        # 本文档
```

## 工作台 8 个面板

| 面板 | API 接口 | 功能 |
|------|----------|------|
| 数据上传 | POST /api/v1/data/upload | 上传 JSONL 文件 |
| 种子生成 | POST /api/v1/data/generate | 调智谱 API 自动生成训练数据 |
| 训练管理 | POST /api/v1/training/start + GET /status | 启动训练 + 轮询进度 |
| 联邦聚合 | POST /api/v1/federation/aggregate | 触发 FedAvg 加权聚合 |
| 模型下载 | GET /api/v1/aggregation/download/{id} | 下载聚合权重 |
| 推理聊天 | POST /api/v1/inference/v1/chat | 三级降级链：本地→智谱→mock |
| 积分管理 | GET /api/v1/integral/balance | 查看余额 + 交易流水 |
| 审计日志 | GET /api/v1/privacy/audit-log | 查看操作记录 |

## 领域选项（7 个）

| 值 | 显示名 |
|----|--------|
| law | 法务 |
| vet_feline | 兽医（猫内科） |
| vet_exotic | 兽医（异宠） |
| med_chronic | 医疗（慢病） |
| fin_compliance | 金融（合规） |
| ind_equipment | 工业（设备维护） |
| edu_analysis | 教育（学情分析） |

## 色彩变量

| 变量 | 值 | 用途 |
|------|-----|------|
| --brand-orange | #FF781F | 主按钮、数字、链接 hover |
| --brand-orange-dark | #E66A00 | 按钮 hover |
| --bg-white | #FFFFFF | 主背景 |
| --bg-gray | #FAFAFA | 交替区块背景 |
| --text-main | #121212 | 正文 |
| --text-aux | #707070 | 辅助文字 |
| --border-light | #F0F0F0 | 卡片边框 |
| --shadow-hover | 0 4px 12px rgba(0,0,0,0.06) | 卡片 hover |

## 部署方式

推送到 `firefly-lm-org/website` 仓库 → Vercel 自动部署 → `firefly-lm.com`

Vercel 设置：
- Framework Preset: **Other**
- Build Command: 留空
- Output Directory: 留空

## API 地址配置

- 本地开发：`http://106.14.220.169:8080`（直连服务器）
- 生产环境：`https://api.firefly-lm.com`（域名，需 ICP 备案后生效）

在 `api.js` 第 8-11 行修改 `API_BASE` 变量。

## 浏览器支持

Chrome / Firefox / Safari / Edge 最近 2 个版本。
需支持：CSS Grid、CSS Variables、backdrop-filter。
