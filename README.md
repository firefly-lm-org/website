# firefly-lm-org/website

萤火虫大模型官方网站静态资源。

## 部署

- 平台：Vercel
- 自定义域名：firefly-lm.com
- 部署方式：手动 API 触发（GitHub 未联动）

## 文件结构

```
website/
  index.html           首页（Hero + Status + Links + News）
  style.css            极简浅色主题 + 暗色自适应 + 移动端
  vercel.json          Vercel 配置（安全头 + 缓存 + 路由）
  VALUATION_GATES.md   v0.1 6/6 估值解锁条件
  RISK_MANAGEMENT.md   Top 5 技术风险 + 缓解措施
  README.md            本文件
  PUSH_TO_GITHUB.md    推送备忘
  _headers             Cloudflare 备用安全头
  robots.txt           SEO
  sitemap.xml          SEO
```

## v0.1 状态

- 6/6 估值解锁条件通过
- 官网可访问：https://firefly-lm.com
- 安全头：HSTS + X-Frame-Options: DENY + nosniff

## 三端互链

- 官网 -> GitHub: https://github.com/firefly-lm-org
- 官网 -> Afdian: https://afdian.com/a/firefly-lm
- GitHub README -> 官网 + 赞助链接
- 爱发电简介 -> 官网 + 仓库

## 更新流程

1. 修改文件
2. git add / commit / push
3. Vercel 手动 API 触发部署
4. 无痕窗口验证
