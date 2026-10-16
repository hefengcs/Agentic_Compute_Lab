# Agentic Compute Lab

极简学术主页。纯静态 HTML / CSS，无前端框架、运行时 JavaScript 或 npm 依赖。内容在构建时写入 HTML，禁用 JavaScript 也可完整阅读。

## 本地构建与预览

需要 Node.js 20+；预览命令使用 Python 3。

```sh
npm run build
npm run preview
```

打开 http://127.0.0.1:4173 。也可用 `npm run dev` 一次完成构建和启动预览。修改内容或样式后重新执行 `npm run build` 并刷新页面；没有自动热更新。

## 更新内容

编辑 `data/content.json`，然后重新构建。数组顺序即显示顺序，News 和 Blog 例外，会按记录日期倒序排列。相同日期保留录入顺序。JSON 中的文案按纯文本处理；博客正文使用 HTML，见下文。

| 配置 | 字段 |
| --- | --- |
| `site` | 名称、副标题、SEO 简介、站点完整地址 `url`（以 `/` 结尾）、GitHub 地址、版权年份 |
| `about` | 简介正文 |
| `news` | `date`（YYYY-MM 或 YYYY-MM-DD）、`text`；可选 `url` 将消息链接到论文或发布页 |
| `blog` | `slug`（唯一的小写字母、数字和连字符）、`title`、`date`（YYYY-MM）、`category`、`description` |
| `research` | `title`、`description` |
| `people` | `name`、`role`；可选 `url` |
| `projects` | `title`、`description`；可选 `status`、`contributors`（姓名数组）、`paper`、`code`、`project`（项目页 URL） |
| `publications` | `title`、`authors`（姓名数组）、`venue`（会议名称或 arXiv）、`year`；可选 `paper`、`code`、`project` |
| `join` | `paragraphs`（段落数组）、`email`（未确定时为 null） |

新增 News 时只需在 `news` 中增加一条日期和消息记录。成员直接追加到 `people`，`role` 可使用 Research Intern、Research Contributor 或 Collaborator，不会生成空分类。论文的 `paper` 可以直接填写 arXiv URL；只显示填写的资源链接。项目与论文数组为空时，隐藏对应栏目和导航链接；添加第一条真实记录后，重新构建会自动显示。

News 中有实际发布日期依据的事件精确到日；只有月份依据的记录保留月份，不为统一格式补写日期。页面按记录精度显示，例如 `2026-10-16` 显示为 `Oct 16, 2026`，`2026-10` 仍显示为 `Oct 2026`。

新增博客时，在 `blog` 中添加文章信息，并将正文写入 `src/posts/<slug>.html`（仅正文 HTML，不包含整个页面）。构建会使用 `src/post.html` 生成 `docs/blog/<slug>/index.html`，首页 Blog 自动显示链接；`blog` 为空时隐藏栏目和导航。需要在 News 中宣传时，再添加一条带文章完整 URL 的记录。文章保留独立标题、简介、canonical URL 和 Open Graph metadata，使用与首页相同的本地字体和样式。

V0 设计已冻结：正文最大宽度为 800px，后续以维护真实内容为主。

只收录实验室成立后产生的真实公开成果；不将成员过去的论文追溯归属到实验室。当前未配置联系邮箱，GitHub 指向本站公开仓库。

## 文件结构

- `data/content.json`：日常维护的内容
- `src/template.html`：语义化页面结构和 metadata
- `src/post.html`：博客文章页模板
- `src/posts/`：博客正文 HTML
- `assets/styles.css`：布局与排版
- `assets/fonts/`：本地托管的 Lato 字体及 OFL 许可证
- `scripts/build.mjs`：使用 Node.js 内置模块生成静态站点
- `docs/`：生成的部署产物，随源代码一起提交，不手动编辑

## 部署

网站地址：https://hefengcs.github.io/Agentic_Compute_Lab/

网站由独立仓库 `hefengcs/Agentic_Compute_Lab` 管理，以项目站点形式发布在个人域名下。

使用 GitHub Pages 的分支部署：Settings → Pages → Source 选择 **Deploy from a branch**，分支为 `main`，目录为 `/docs`。无需自定义 Actions 工作流或额外的 workflow 写入权限。

每次更新真实内容后，构建并提交源文件和生成页面：

```sh
npm run build
git add data/content.json src/posts/ docs/
git commit -m "Update lab content"
git push origin main
```

如果同时修改了模板、样式或构建脚本，也将对应源文件加入提交。GitHub Pages 会自动发布提交后的 `docs/`。

也可将 `docs/` 中的内容交给任何静态托管服务。资源使用相对路径，同时支持 GitHub Pages 根域名和仓库子路径。

## 排版参考

字体栈参考 [Feng He 的个人主页](https://hefengcs.github.io/)，使用 Lato、Verdana、Helvetica、sans-serif。信息组织参考 [Princeton NLP Group](https://princeton-nlp.github.io/)，保留靠前的 News 与传统文字列表。字体本地托管，无第三方请求。
