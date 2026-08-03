# Firefly LM · 极简版官网

## 设计原则

1. **白色为主**：页面背景纯白，文字深灰/黑，无渐变、无阴影、无装饰图形
2. **极简排版**：单列居中，最大宽度 760px，大量留白，无 Bento Grid、无卡片堆叠
3. **去掉装饰**：无 emoji 图标（除品牌名一处）、无毛玻璃、无进度条动画、无彩色徽章
4. **内容为王**：每个区块只回答一个问题——这是什么、怎么用、隐私如何保障
5. **响应式**：移动端自动塌为单列，字号略微缩小

## 文件结构

```
firefly-website-v2/
├── index.html        # 官网首页（极简白）
├── workspace.html   # 工作区（极简白）
└── README.md        # 本文件
```

## 与原版差异

| 原版（v0.6.3） | 极简版（v2） |
|---|---|
| 暗色背景 #0A0A0A | 纯白 #fff |
| Bento Grid 多列卡片 | 单列居中 760px |
| 橙色主色 #FF6B00 | 黑白灰，无主色 |
| 毛玻璃吸顶导航 | 普通底边框导航 |
| 彩色状态徽章 | 文字标签 |
| 进度条渐变 | 灰色进度条 |
| emoji 图标密集 | 仅品牌名保留 🔥 |
| 装饰性动画 | 仅淡入，尊重 reduced-motion |

## 部署

同原版，推送到 `firefly-lm-org/website` 仓库，Vercel 自动部署。
Vercel 项目设置：Framework Preset = Other，Build Command 留空，Output Directory 留空。
