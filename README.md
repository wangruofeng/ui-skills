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

完整保留上游注册表中的 804 条技能目录、公开专题、作者、智能体、组件、图标、设计系统、Design.md 与实践指南。中英文界面共享字典，技能名称、说明、正文及安装命令保留原文。搜索支持 Command/Ctrl+K，详情与返回保持语言路径。

登录、个人收藏、招聘、赞助及邮件订阅跳转原站，不收集本站账号、邮箱或支付信息。MCP 文档指向原站提供的真实 MCP 服务。本站不运行原作者的统计上报。46 个原站静态图片已本地化；作者头像与其他明确的外部来源仍保留公开来源链接。

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
