# 部署指南（EdgeOne Pages · 国内节点）

## 入口

- 国内站产品页 / 控制台入口：**https://edgeone.cloud.tencent.com/pages**
- 登录后进「边缘安全加速平台 EO 控制台」→ 首次会到「场景选择大厅」，
  鼠标移到「创建项目」可选：导入 Git 仓库 / 从模板开始 / **直接上传**；
  若已有其它资源，点最上方的 **Pages** Tab 切换后再选创建方式。
- 默认域名形如 `xxx.edgeone.dev`（参考同账号下的小屋日志 `mycabinlog.edgeone.dev`）。

> ⚠️ 官方明确：以「上传文件」方式创建的项目**无法再切换到 Git 集成**，
> 以后每次改动都要重新打包上传。若打算长期迭代，优先走 Git 关联。

## 产物

| 项 | 值 |
|---|---|
| 构建命令 | `npm run build`（= `tsc -b && vite build`） |
| 输出目录 | `dist/` |
| 产物大小 | 12 MB / 180 个文件 |
| 上传用 zip | `../locker-site-dist.zip`（9.8 MB，顶层即 `index.html`） |
| Node | 未锁版本，Node 18+ 均可（本地用 22 构建通过） |

**已完成的国内适配（2026-09-09）**：字体全部自托管在 `dist/fonts/`，
零外部请求（不再依赖 fonts.googleapis.com / fonts.gstatic.com）。
中/日文走系统字体栈。项目是纯静态、无 history 路由，**不需要 SPA 回退配置**。

---

## 方式 A：控制台上传 zip（最快，但后续不能转 Git）

1. 打开 EdgeOne Pages 控制台 → 新建项目
2. 选择「直接上传」/「上传文件」
3. 上传 `locker-site-dist.zip`（或整个 `dist/` 文件夹）
4. 等待部署完成，拿到默认域名 `xxx.edgeone.dev`

## 方式 B：Git 仓库关联（长期最省事）

> 注意：当前仓库**没有 remote**，`dist/` 也被 `.gitignore` 排除，
> 所以平台需要自己构建。

1. 在 GitHub 建仓库（如 `Paloma333/portfolio`），把 locker-site 推上去：
   ```bash
   cd /Users/liuyushan/WorkBuddy/个人网站/locker-site
   git remote add origin git@github.com:Paloma333/portfolio.git
   git push -u origin main
   ```
2. EdgeOne Pages 控制台 → 关联 Git 仓库 → 选这个仓库
3. 构建配置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 根目录：`/`（如果仓库根就是 locker-site）
4. 之后每次 `git push` 自动重新部署

## 方式 C：EdgeOne CLI

腾讯云 EdgeOne 提供 CLI（包名 `edgeone`）。因为 CLI 的命令格式会随版本变，
以官方文档为准：控制台 → EdgeOne Pages → 部署指引里会给出当前版本的
`edgeone pages deploy` 用法和登录方式。

---

## 绑定自己的域名（可选）

默认 `xxx.edgeone.dev` 可直接用、自带 HTTPS。
要绑自己的域名：

1. 在 EdgeOne Pages 项目里添加自定义域名
2. 到你的 DNS 服务商加一条 CNAME 指向平台给的接入地址
3. **国内节点要求域名已备案**（香港/海外节点则不需要；Pages 部署时可选节点区域）

---

## 校验清单

部署后逐项确认：

- [ ] 首页加载，无白屏
- [ ] 字体正常（导航 ABOUT / SKILLS 等字母是 Inter，不是回退字体）
- [ ] `/fonts/fonts.css` 返回 200
- [ ] 3D 柜体能交互（SKILLS 唱片机、SELECTED WORK 文件盒）
- [ ] PROJECTS 四个项目正常滚动，封面图加载
- [ ] Gephi / J-Rock 弹窗能打开（`/gephi/`、`/jrock/` 数据文件可达）
- [ ] 控制台 Network 里**没有任何 fonts.googleapis.com 请求**

## 其他

- `package.json` 里的 `deploy` 脚本目前是 Cloudflare Wrangler
  （`bunx wrangler deploy`），迁到 EdgeOne 后可以不用它，或改指向 EdgeOne。
- 产物里 3D 模型/纹理占 9.8 MB，是体积大头；EdgeOne 免费额度足够。
