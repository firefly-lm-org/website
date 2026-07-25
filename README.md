# firefly-lm-org/website

萤火虫大模型（Firefly LM）官网静态站点源码。

## 状态

**v0.1 ✅ 6/6 VALUATION_GATES 全解锁**（2026-07-25）

## 部署

- 平台：Vercel（连 GitHub 自动部署）
- 域名：firefly-lm.com（阿里云注册 + DNS 解析）
- SSL：Vercel 自动签发 + Cloudflare Email Routing
- 安全头：vercel.json 配置 6 项（CSP/HSTS/X-Frame/Referrer/Permissions/XSS）

## 文件结构

```
website/
├── index.html              # 官网首页（Hero + What + Status + News + Links）
├── style.css               # 极简浅色主题 + 暗色自适应 + 移动端适配
├── vercel.json             # Vercel 配置（www 重定向 + 安全头 + 缓存策略）
├── _headers                # Cloudflare 备用安全头
├── robots.txt              # SEO 爬虫规则
├── sitemap.xml             # SEO 站点地图
├── README.md               # 本文件
├── PUSH_TO_GITHUB.md       # 推送命令备忘
├── VALUATION_GATES.md      # 估值解锁条件清单（v0.1~v2.0）
└── RISK_MANAGEMENT.md      # Top 5 技术风险 + 缓解措施
```

## 本地预览

```bash
# 任意静态服务器
python3 -m http.server 8080
# 或
npx serve .
```

打开 http://localhost:8080

## 更新流程

1. 修改对应文件
2. `git add . && git commit -m "feat: ..."`
3. `git push` → Vercel 自动部署（约 10~30 秒）
4. 打开 https://firefly-lm.com 验证
