> 当前说明以仓库里的现有代码为准。原型 Phase 1–13 与商业化 Phase 1–6 的验收记录仍在 `docs/`，写的是各阶段当时的结果。公开作品广场后来改为远程投影，见「数据放在哪里」。

# 情绪与艺术网站原型

把一段想法变成一幅私密画作。登录、文字分析、配图、创作额度和支付都在浏览器里模拟。真实 AI、真实支付和真实账号仍未实现。作品公开时，客户端把公开投影交给 Supabase 的 HTTP 接口；原文、账号、额度和购买记录留在本机。

依赖版本记录在 `package-lock.json`。

## 运行

需要 Node.js 20.9 或更新版本，与锁定的 Next.js `engines` 一致。GitHub Actions 的 Pages 工作流使用 Node.js 22。先安装依赖，再启动；不要假设本机已经装好 `node_modules`：

```bash
npm ci
npm run dev
```

`npm ci` 按 `package-lock.json` 安装。开发服务器地址是 http://localhost:3000 。

公开站点由 GitHub Pages 提供：https://1211446243-hub.github.io/Emotion-Webside/ 。它不替换个人主页 https://1211446243-hub.github.io/ 。

### 本地 Next 与静态 Pages

| | 本地开发 `npm run dev` | 本地生产 `npm run build` 后 `npm start` | GitHub Pages |
| --- | --- | --- | --- |
| 生成 | 浏览器把文字发给同源 `/api/generate`。服务器只用 Mock Provider，不请求外部 AI | 同样走 `/api/generate`，仍是带 Node 服务器的 Next | `GITHUB_PAGES=1` 时设置 `NEXT_PUBLIC_STATIC_GENERATION=1`，Mock 生成在浏览器内完成。`scripts/export-github-pages.mjs` 会暂时移开 `app/api` 与 `app/debug`，构建结束后放回 |
| 私密作品、账号、额度、模拟支付 | 本机 localStorage | 同左 | 同左 |
| 公开广场 | `next.config.ts` 的 `env` 提供广场配置后，客户端请求远程公开投影 | 同左 | 同左。静态站点没有本机 API 路由 |
| `/debug` | `NODE_ENV` 为 development 时页面可用 | 代码在其他 `NODE_ENV` 下调用 `notFound()` | 导出不包含 `app/debug` |

常用脚本：

```bash
npm run lint
npm test
npm run inspect:text
npm run build
npm start
```

`npm test` 是 `tsx --test tests/*.test.ts`，不加载 `next.config.ts` 的 `env`。没有另外设置广场变量时，测试里的公开列表仍来自本机存储，不能据此认为远程广场已经测过。`npm run inspect:text` 只在本地打印 Mock 文本分析，不联网。

Pages 的发布步骤在 `.github/workflows/pages.yml`：`npm ci` 之后执行 `node scripts/export-github-pages.mjs`，由脚本设置 `GITHUB_PAGES=1`。这条工作流不检查远程广场是否可读写，也不检查权限配置。

### 配置名

Mock 生成、登录、额度和模拟支付不需要 `.env`。`.env.example` 中的 `TEXT_AI_PROVIDER` 与 `IMAGE_AI_PROVIDER` 默认为 `mock`。业务代码不读取 `DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`RUNNINGHUB_API_KEY`、`DATABASE_URL`。可选的 `MOCK_GENERATION_FAIL_STAGE` 取值为 `understanding`、`shaping` 或 `painting`，写在 `.env.local` 后需重启开发服务器。原始错误只出现在开发环境日志中，不打印输入文字。

广场客户端读取 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_KEY`。两个名字都非空时 `galleryEnabled()` 为真（`lib/storage/public-gallery.ts`）。Next 开发、`next build` 和 Pages 导出会从 `next.config.ts` 的 `env` 注入它们。本文不记录这两个变量的值。`env` 中的值会进入浏览器脚本，供广场客户端使用。

仓库没有附带 `public_moments` 的表定义，也没有 `publish_moment`、`unpublish_moment` 的 SQL 或权限配置。下面只描述客户端会发起的调用，不表示远程接口已经验证可用，也不表示权限检查已经通过。

## 数据放在哪里

私密部分留在当前浏览器，并按来源分开。`localhost:3000` 与 `127.0.0.1:3000` 的本机数据不共用。

- 登录状态使用 `mock_auth` 和 `mock_user`，不保存邮箱或密码。合法邮箱和 8–128 字符密码即可登录；注册还校验昵称和密码确认。任何合法信息都对应同一个 `demo-user`。
- 作品全文、收藏和点赞使用 `thought_artworks_v1`。创作额度与流水使用 `untitled_commerce_v1`。模拟购买记录使用 `untitled_purchases_v1`。退出登录保留这些数据；存储被禁用或数据损坏时显示错误，不自动清空。
- 新 Mock 用户幂等获得 3 次免费创作。作品成功保存后才按 Artwork.id 扣减；生成失败或保存失败不扣减。
- Mock Payment 只在本机把购买从 `pending` 改为 `paid`，不联系支付网络。购买 ID 是额度入账的幂等键。

公开投影在 `galleryEnabled()` 为真时走远程接口：

- 列表和单条读取请求 `public_moments`，选择作品 id、短句、图片路径、作者昵称和创建时间。
- 公开调用 `publish_moment`。请求类别为作品 id、短句、图片路径、作者昵称、创建时间，以及本机令牌。取消公开，以及删除已公开作品，调用 `unpublish_moment`，只发送作品 id 和本机令牌。令牌存在 `thought_gallery_owner_v1`，字段名为 `moment_token`。
- 短句去掉空白后须有内容，长度按 JavaScript 字符串计不超过 80；昵称截断到 32 后仍须有内容；图片路径只能是现有 6 张本地 SVG 的站点路径（`/mock/artworks/` 下的文件名）。不符合的远程行会被客户端丢弃；不符合的公开请求会在发出前失败。
- 不上传原文、情绪分析、生成提示词、邮箱、密码、创作额度或购买记录。公开详情地址是 `/artwork?id=…&view=public`，即使作者本人打开也不展示原文、分析或提示词。
- 点赞数按本机 `thought_artworks_v1` 计算，不写回远程。另一台浏览器上的点赞数是它自己的本地计数。
- 远程读取失败时提示暂时无法读取或无法连接；更新失败时提示暂时无法更新或无法连接。失败后不改本机公开标记，也不删除本机作品；广场不会退回列出只存在于本机的公开作品。远程调用已经成功、本机写入随后失败时，两边可能不一致；客户端没有跨两边的事务。
- 清除本站数据会去掉本机作品、额度和 `thought_gallery_owner_v1`。代码不会在清除本地存储时自动调用 `unpublish_moment`。

两个广场变量缺一不可，否则公开列表、公开和取消公开只处理本机数据，分享文案会说明链接不能跨设备。Next 应用因为 `next.config.ts` 注入了这两个名字，走的是远程分支。

## 当前范围

- 品牌名称只需修改 `config/site.ts` 的 `name`；导航、页脚和 Metadata 自动同步。
- 首页包括 15 条原创提示（每次加载随机选一次）、2–1000 字符输入、自动增高、近上限计数、移动菜单、三幅 CSS 意象占位构图。
- Enter 与 Shift+Enter 均换行。空白或不足两个字符时按钮禁用。
- 首页提交后进入 `/create`。未登录时先进入 `/login`，登录或注册后自动继续生成，文字不丢失。
- 尚未生成的输入草稿保留在根布局 Context，登录、Paywall 和 Mock Checkout 往返时不会丢失；刷新后清空，不放入 URL。生成成功后，原文随私密 Artwork 一起保存到本浏览器，供本人详情页折叠查看。
- `/pricing` 只展示当前唯一 active 商品「初心作品包」：¥19.9 / 5 次完整创作。免费次数耗尽时弹出 UnlockCreationModal，用户可进入明确标注的 Mock Checkout；购买成功后增加 5 次付费创作并自动继续刚才的文字。
- entitlement 由 `config/creation-entitlements.ts` 集中管理：免费额度对应 `free`，购买额度对应 `full`。免费创作保存主作品与原创短句；完整创作额外保存 3 个候选版本和哲学主题说明。
- 新作品在兼容的 Artwork 外层中保存完整 CreationSession，包括主作品、候选作品、哲学内容、权益快照与 4:5 比例。`cost` 和 `providerUsage` 仅做可选类型预留，Mock 阶段不写真实用量或成本。
- 导航「作品」进入 `/me/artworks`，「广场」进入 `/gallery`，昵称进入 `/me`；个人空间可进入 `/me/favorites`。
- 已定义 EmotionAnalysis、EmotionType、PhilosophyTheme、ArtStylePreset、Artwork、User、文字/图片 Provider 和 Repository 接口。
- 15 个哲学主题均有关键词、隐喻、环境、光线、构图、色彩；Mock 文本 Provider 支持多种情绪和主题、强度范围、兜底分析与原创短句。
- PromptBuilder 是纯函数，可独立测试，默认后印象派、4:5，支持 6 种风格与严格人物约束。
- 已实现 MockImageProvider，按视觉关键词选择 6 张本地 SVG。它们是代码绘制的构图，尺寸为 800×1000，均无清晰正脸。
- GenerationService 依次执行分析 → 提示词 → 图片 → 短句 → 私密 Artwork。本地 Next 经 `/api/generate` 发送进度；Pages 静态构建在浏览器内调用同一套 Mock。页面只调用客户端服务入口。
- 三阶段等待默认 950ms / 850ms / 2400ms，总计约 4.2 秒；`config/generation.ts` 集中配置，首轮开发编译耗时另计。
- 动画为模糊色块逐步清晰，再显现已加载的图片；支持减少动画偏好、取消、失败重试、加载失败及网络超时处理。
- 生成后自动保存为私密作品，动画结束后进入 `/artwork?id=`。保存失败保留当前结果，允许重试保存，不重新生成、不重复插入。
- 详情页支持保存确认、收藏、下载本地 SVG、分享、公开/取消公开及确认删除。只有本人能看到原文和管理操作；原文默认折叠。
- 我的作品和收藏采用画廊，手机单列/双列；个人空间显示作品、收藏及公开作品数量。没有作品时提供安静的空状态。
- 收藏按模拟用户记录在本机，重复点击可取消。点赞同样只记在本机。远程广场开启时，删除已公开作品会先请求取消公开，成功后再清理本机作品、收藏和点赞。
- DeepSeek、OpenAI、Gemini 文本实现以及任何非 `mock` 的图片 Provider 被调用时抛出未实现错误，不发出外部 AI 请求。没有会员、订阅、大作品包、单次付费、比例商城或高级风格商城。

## 目录

```text
app/                  首页、登录、注册、生成、作品详情、个人空间、广场、购买记录、开发调试
components/layout/    Header、手机导航、Footer
components/home/      标题、输入、随机提示、意象选览
components/auth/      AuthState、账号入口、登录/注册表单
components/create/    三阶段状态、错误重试和完成展示
components/artwork/   详情、操作、重新表达、分享卡片、响应式数据查询
components/gallery/   收藏/作品/广场画廊
components/profile/   个人空间统计与购买记录
components/commerce/  Paywall、Mock Checkout、Pricing 与余额订阅
components/ui/        带焦点管理的删除确认弹窗
config/site.ts        集中品牌配置
config/commerce.ts    免费次数与当前唯一 active 商品配置
config/creation-entitlements.ts  free/full 权益集中规则
data/                 哲学主题、风格词汇、原创短句、放松提示
lib/ai/text/          文本接口、工厂、Mock、真实 Provider 占位
lib/ai/image/         图片接口、工厂、MockImageProvider
lib/ai/               PromptBuilder、GenerationService、客户端传输入口
lib/auth/             AuthProvider、MockAuthProvider、统一服务
lib/commerce/         额度 Repository、余额/权限/完成编排 Service
lib/creation/         CreationSession 校验、一次重新表达、分享卡片
lib/payment/          PaymentProvider、MockPaymentProvider 与支付编排
lib/analytics/        固定行为名的 Mock Analytics，不保存私人内容
lib/debug/            仅开发环境的额度预设与下一次失败开关
lib/storage/          本机 Repository，以及公开投影的远程客户端
types/                核心业务类型
tests/                分析、生成、认证、额度与本机 Repository 测试
scripts/              文本检查、本地 SVG、Pages 静态导出
public/mock/artworks/ 6 张 4:5 本地 SVG 占位作品
docs/plans/           当时的设计范围
output/playwright/    本地浏览器检查截图（Git 忽略）
```

架构边界见 `lib/README.md`。尚未实现的商业路线见 `FUTURE.md`。

本地 `/api/generate` 只做 Mock 传输，服务器不写数据库，生成结果由浏览器保存。Mock 登录不是服务端身份认证，也不加密 LocalStorage。分享优先使用 Web Share，否则复制链接。私密作品不会因为复制链接而变成公开。

重建本地图片可运行 `node scripts/create-mock-artworks.mjs`，结果确定且无需网络。

## 阶段验收索引

下面各段是对应阶段写下的检查记录。数字和结论保持原样，远程公开广场不在这些记录的验证范围内。

- Phase 1 的生产构建通过，首页已启动检查。
- Phase 2 检查 375px、1440px；截图见 `output/playwright/`。
- 浏览器检查：空输入、单字符、纯空格禁用；Enter / Shift+Enter 换行；提交反馈；1000 字符上限；长文本内部滚动；清空后提示保持一致；手机菜单 Escape 关闭并返回焦点。

Phase 3–5 的验证记录及人工案例检查见 `docs/phase-3-5-validation.md`。变更文件列表见 `CHANGES.md`。

Phase 6–8 验证见 `docs/phase-6-8-validation.md`，当时测试扩展至 29 项。

Phase 9–12 验证见 `docs/phase-9-12-validation.md`，当时 37 项测试通过，覆盖的是本机持久化、公开隐私、权限、收藏点赞、删除和存储故障。

Phase 13 与最终验收见 `docs/phase-13-final-validation.md`，覆盖 375–1920px、键盘与减少动画、空状态、错误恢复、导航、完整流程 A–F、LocalStorage 数据一致性、TypeScript 和生产构建。

商业化 Phase 1 验证见 `docs/commerce-phase-1-validation.md`。当时 44 项测试通过，覆盖免费发放、消费顺序、权限判断、幂等扣减、退款、失败不扣减和损坏存储保护。

商业化 Phase 2 验证见 `docs/commerce-phase-2-validation.md`。当时 48 项测试通过，覆盖 Purchase 状态、支付确认、购买入账幂等、入账失败重试、无效商品与损坏存储保护。

商业化 Phase 3 验证见 `docs/commerce-phase-3-validation.md`。当时 52 项测试通过，覆盖 entitlement 映射、完整 Session、候选作品、哲学内容和旧作品兼容。

商业化 Phase 4 验证见 `docs/commerce-phase-4-validation.md`。当时 55 项测试通过，覆盖一次重新表达、原作品保留和两种分享卡片。

商业化 Phase 5 验证见 `docs/commerce-phase-5-validation.md`。当时 58 项测试通过，覆盖 Analytics 白名单、购买记录和仅开发环境可用的 Debug。

商业化 Phase 6 最终验收见 `docs/commerce-phase-6-validation.md`。当时记录为 60 项测试、Lint、TypeScript 与生产构建通过，并记录生产环境 `/debug` 返回 404。该文件开头有后续状态注。
