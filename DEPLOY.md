# Firefly LM 官网部署指南

> ## ⚠️ 部署真相（2026-08-03 钉死，防止后人踩坑）
>
> - **主站由本仓库（firefly-lm-org/website）驱动**。Vercel 项目名 **`website`**，域名 `firefly-lm.com` / `www.firefly-lm.com`。
> - **旧 Vercel 项目 `firefly-website`（没连 Git 的那个）已废弃删除（2026-08-03），勿再创建/修改。** 它曾导致"推 GitHub 但线上永不更新"的假象——因为主域名绑在它名下而它没有 Git 连接。
> - **改官网 = 推本仓库 main 分支 → Vercel 自动部署（约 30 秒生效），不用碰 Vercel 控制台。**
> - 后端 `api.firefly-lm.com` 需 **ICP 备案通过后**由服务器（106.14.220.169）nginx 放通 443 才可用；备案期间线上页面展示正常、交互（登录/训练/聊天）暂不可达，测试期客户端直连 `http://106.14.220.169:8000`。
> - 服务器网关实际端口是 **8000**（firefly-scheduler.service，uvicorn），不是 8080；`server_p0.py` 是 P0 规划中的独立进程，尚未部署。

## 文件清单

| 文件 | 用途 |
|------|------|
| `index.html` | 官网首页（Hero + 三种模式 + 工作流 + 教育案例 + 隐私 + CTA） |
| `workspace.html` | 登录后工作区（上传/训练/下载/聊天/历史/积分） |
| `style.css` | 共享样式（设计令牌、Bento、卡片、按钮、响应式） |
| `api.js` | 共享 API 封装（fetch 封装、auth、toast、格式化） |
| `DEPLOY.md` | 本文件 |

## 部署方式（Vercel，唯一推荐）

本仓库已连接 Vercel 项目 `website`（Git 集成，production branch = main）。

### 更新线上 = 推 main

```bash
git add .
git commit -m "feat: xxx"
git push origin main
# Vercel 自动部署，约 30 秒生效，无需操作控制台
```

### 首次在新环境连接（一般不需要做）

1. 打开 https://vercel.com/new
2. Import `firefly-lm-org/website` 仓库
3. Framework Preset 选 `Other`（纯静态，**不要选 Python/Node**）
4. Build Command 留空，Output Directory 留空
5. 项目名保持 `website`，域名绑定 `firefly-lm.com` + `www.firefly-lm.com`（www 308 重定向到 apex）

### 域名与证书

- 域名 DNS 已指向 Vercel（CNAME → cname.vercel-dns.com），SSL 证书由 Vercel 自动签发。
- 切勿把域名绑回已废弃的 `firefly-website` 项目。

## API 地址配置

网页端通过 `api.js` 自动判断环境：

| 环境 | API 地址 |
|------|----------|
| `localhost` / `127.0.0.1` | `http://106.14.220.169:8000` |
| 其他（含 firefly-lm.com） | `https://api.firefly-lm.com` |

`https://api.firefly-lm.com` 需备案通过后由服务器 nginx 443 反代到 `127.0.0.1:8000` 才可用（配置见服务器 `/etc/nginx/conf.d/firefly-api.conf`，当前 80→443 301 + webroot 挑战目录）。

## 验证清单

部署完成后逐项验证：

- [ ] `https://firefly-lm.com/` 打开首页，Hero 区正常显示
- [ ] 三种训练模式卡片正确渲染（GPU/CPU/付费）
- [ ] 工作流五步图正常显示
- [ ] 教育案例区正常显示
- [ ] 隐私承诺区正常显示
- [ ] 点击「立即体验」弹出登录框
- [ ] 登录成功后跳转到 `workspace.html`
- [ ] 工作区侧边栏 6 个入口可切换
- [ ] 上传文件区可拖拽 + 点击选择
- [ ] 训练模式三选一正常
- [ ] 移动端（iPhone Safari）打开显示正常
- [ ] 浏览器控制台无 JS 错误

## 回滚

Vercel 面板 → Deployments → 选上一个版本 → Promote to Production。
或：
```bash
git revert HEAD
git push
```
