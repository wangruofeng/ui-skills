# UI Skills 中英文镜像

面向设计工程师的技能、实践指南与资源目录。基于 [Julien Thibeaut / ibelick 的 UI Skills](https://github.com/ibelick/ui-skills)，保留 MIT 许可证和原作者署名。

- 网站：<https://ui-skills.wangruofeng007.com>
- 英文：<https://ui-skills.wangruofeng007.com/en/>
- 开源仓库：<https://github.com/wangruofeng/ui-skills>
- 部署：Cloudflare Pages，连接 GitHub `main`，构建 `npm run build`，输出 `dist`，Node 22。

## 本地运行

```sh
npm ci
npm start
```

开发服务器可预览基本交互；生产构建在中文根路径与 `/en/` 生成独立 HTML。验收双语页面请使用构建预览：

```sh
npm run build
npx wrangler pages dev dist --port 4321
```

## 本镜像范围

完整保留上游注册表中的 804 条技能目录、公开专题、作者、智能体、组件、图标、设计系统、Design.md 与实践指南。中英文界面共享 `public/i18n/zh-CN.json` 词典，覆盖导航、目录简介、资源与设计文档、搜索、账号收藏、错误提示和元数据；技能名称、Markdown 正文、代码及安装命令保留原文。搜索支持 Command/Ctrl+K，可同时匹配中文译文与英文原文，详情与返回保持语言路径。翻译维护与漏译检查见 [多语言文案维护](docs/多语言文案维护.md)。

本站支持 GitHub OAuth 登录与按账号持久保存技能收藏，入口位于右上角登录和技能详情星标。登录后通过头像菜单进入“我的收藏”。会保存 GitHub 提供的用户名称、邮箱、头像和必要会话数据，收藏写入本站独立 Cloudflare D1；不会申请仓库读写权限。招聘、赞助入口继续跳转原站，页底不再展示招聘与订阅推广卡片。MCP 文档指向原站提供的真实 MCP 服务。本站不运行原作者的统计上报。46 个原站静态图片已本地化；作者头像与其他明确的外部来源仍保留公开来源链接。

部分上游技能地址返回 404，原站公开快照也无法获取。此时详情会明确提示只能展示目录简介并提供原仓库链接，不将简介当作完整正文。每次构建生成 `dist/data/unavailable-sources.json` 记录当次无法获取的来源。

## 构建与验证

```sh
npm run typecheck
npm test
npm run build
npm run verify:site
```

构建前并发预取公开 Markdown，缓存放在忽略的 `.cache/skills/`。缓存仅在显式构建模式开启，不影响测试；构建过程可能依赖第三方公开内容源的可用性。中文与英文页面生成独立 canonical、双向 hreflang 和双语 sitemap。Cloudflare 的静态 404 页面保证不存在的路径返回 HTTP 404。

## 版权

原网站代码 © 2026 Julien Thibeaut，MIT，见 [LICENSE](LICENSE)。每个收录技能和外部资源的版权与使用许可归其作者，网站的 MIT 许可不替代各技能或资源的原始许可。镜像界面与部署维护：wangruofeng。本项目不发布或冒充官方 `ui-skills` npm 包。

## 登录与收藏配置

Pages Functions 仅接管 `/api/*`，公开内容仍为静态 HTML。GitHub OAuth 回调严格使用 `https://ui-skills.wangruofeng007.com/api/auth/callback/github`。生产环境的 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`BETTER_AUTH_SECRET` 存放在 Cloudflare 加密环境变量，不进入源码。`AUTH_DB` 绑定独立数据库，迁移位于 `migrations/`。预览环境关闭登录且不绑定生产数据库。

本地测试使用忽略的 `.dev.vars` 配置测试值，执行 `npx wrangler d1 migrations apply AUTH_DB --local`、`npm run build`，再用 `npx wrangler pages dev dist`。GitHub 真实登录需另配回调匹配 localhost 的开发 OAuth App；勿覆盖生产应用回调。

认证采用 Better Auth 的安全 Cookie、数据库 OAuth state、限流和同源校验。收藏 API 逐请求校验会话及账号，匿名请求返回 401，跨来源写入返回 403；响应禁止浏览器和 CDN 缓存。
