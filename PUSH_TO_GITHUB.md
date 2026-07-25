# 推送说明

## 文件清单（website 仓库根目录）

| 文件 | 作用 |
|------|------|
| `index.html` | 官网首页（需你从 firefly-website.zip 解压后放入） |
| `style.css` | 极简浅色样式 + 移动端适配 |
| `vercel.json` | Vercel 配置：www 重定向 + 6 项安全头 + 缓存策略 |
| `VALUATION_GATES.md` | 估值解锁条件清单（v0.1 已 6/6 ✅ 全解锁） |
| `PUSH_TO_GITHUB.md` | 本文件 |

## 推送命令

```bash
cd ~/Desktop/website

# 如果还没初始化
git init
git add .
git commit -m "feat: add VALUATION_GATES.md v0.1 6/6 unlocked + vercel config"
git remote add origin https://github.com/firefly-lm-org/website.git
git push -u origin main
```

## 推送后验证

| 验证项 | 方法 | 期望 |
|--------|------|------|
| 官网在线 | 打开 https://firefly-lm.com | 显示首页 |
| www 重定向 | 打开 https://www.firefly-lm.com | 301 → 裸域 |
| 安全头 | https://securityheaders.com/?q=firefly-lm.com | A 或 A+ |
| VALUATION 可访问 | https://github.com/firefly-lm-org/website/blob/main/VALUATION_GATES.md | 6/6 ✅ |
