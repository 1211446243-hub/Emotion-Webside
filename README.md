> 当前商业化开发进度：Phase 1–6 已完成。最终商业链路验收、37 项检查及 Mock 边界见 docs/commerce-phase-6-validation.md。
> 新增 /me/purchases 与仅开发环境可用的 /debug。Analytics 只在开发控制台输出固定行为名与时间，不联网、不保存私人内容。

# 情绪与艺术网站原型

当前完成原型 **Phase 1–13 与最终验收**，以及商业化系统 **Phase 1–6**：首页、Mock 登录、文字分析与图片生成模拟、完整生成动画、作品详情、本地 Repository、个人空间、收藏、作品广场、创作额度、Pricing、Paywall、Mock Payment、完整创作权益、重新表达、分享卡片、Mock Analytics、购买记录和开发调试。首页保持原有版式；项目未接入任何真实 AI API、数据库、真实支付或身份认证服务。依赖版本记录在 package-lock.json。

## 运行

需要 Node.js 20.9 或更新版本，本地验证使用 Node.js 24。

```bash
npm install
npm run dev
```

打开 http://localhost:3000。检查命令：

```bash
npm run lint
npm test
npm run inspect:text
npm run build
npm start
```

## 当前范围

- 品牌名称只需修改 `config/site.ts` 的 `name`；导航、页脚和 Metadata 自动同步。
- 首页包括 15 条原创提示（每次加载随机选一次）、2–1000 字符输入、自动增高、近上限计数、移动菜单、三幅 CSS 意象占位构图。
- Enter 与 Shift+Enter 均换行。空白或不足两个字符时按钮禁用。
- 首页提交后进入 `/create`。未登录时先进入 `/login`，登录或注册后自动继续生成，文字不丢失。
- 尚未生成的输入草稿保留在根布局 Context，登录、Paywall 和 Mock Checkout 往返时不会丢失；刷新后清空，不放入 URL。生成成功后，原文随私密 Artwork 一起保存到本浏览器，供本人详情页折叠查看。
- `/login` 和 `/register` 为 Mock 表单：合法邮箱、8–128 字符密码即可登录；注册还校验昵称和密码确认。任何合法信息都对应唯一的 `demo-user`，没有真实账号验证。
- 登录状态使用 `mock_auth=true` 和 `mock_user`，不保存邮箱或密码。作品、收藏及点赞使用 `thought_artworks_v1`；创作额度与流水使用 `untitled_commerce_v1`；模拟购买记录使用 `untitled_purchases_v1`。退出登录保留数据，刷新恢复；存储被禁用时显示错误。
- 新 Mock 用户幂等获得 3 次免费创作。生成前通过统一 Policy 检查权限；作品成功保存后才按 Artwork.id 幂等扣减，生成失败或保存失败不扣减。
- `/pricing` 只展示当前唯一 active 商品「初心作品包」：¥19.9 / 5 次完整创作。免费次数耗尽时弹出 UnlockCreationModal，用户可进入明确标注的 Mock Checkout；购买成功后增加 5 次付费创作并自动继续刚才的文字。
- Mock Payment 通过 `PaymentProvider` 接口与额度系统组合，购买记录先保存为 `pending`，模拟确认后改为 `paid`。购买 ID 同时作为额度入账幂等键，重复完成不会重复增加次数。
- entitlement 由 `config/creation-entitlements.ts` 集中管理：免费额度对应 `free`，购买额度对应 `full`。免费创作保存主作品与原创短句；完整创作额外保存 3 个候选版本和哲学主题说明。
- 新作品在兼容的 Artwork 外层中保存完整 CreationSession，包括主作品、候选作品、哲学内容、权益快照与 4:5 比例。`cost` 和 `providerUsage` 仅做可选类型预留，Mock 阶段不写真实用量或成本。
- 导航「作品」进入 `/me/artworks`，「广场」进入 `/gallery`，昵称进入 `/me`；个人空间可进入 `/me/favorites`。
- 已定义 EmotionAnalysis、EmotionType、PhilosophyTheme、ArtStylePreset、Artwork、User、文字/图片 Provider 和 Repository 接口。
- 15 个哲学主题均有关键词、隐喻、环境、光线、构图、色彩；Mock 文本 Provider 支持多种情绪和主题、强度范围、兜底分析与原创短句。
- PromptBuilder 是纯函数，可独立测试，默认后印象派、4:5，支持 6 种风格与严格人物约束。
- 已实现 MockImageProvider，按视觉关键词选择 6 张本地 SVG 艺术化占位图。它们是代码绘制的原创构图，不是模型生成的油画；尺寸为 800×1000，均无清晰正脸。
- GenerationService 依次执行分析 → 提示词 → 图片 → 短句 → 私密 Artwork；通过本地 `/api/generate` 流式发送进度，页面只调用客户端服务入口，不调用 Provider。
- 三阶段等待默认 950ms / 850ms / 2400ms，总计约 4.2 秒；`config/generation.ts` 集中配置，首轮开发编译耗时另计。
- 动画为模糊色块逐步清晰，再显现已加载的图片；支持减少动画偏好、取消、失败重试、加载失败及网络超时处理。
- 生成后自动保存为私密作品，动画结束后进入 `/artwork/[id]`。保存失败保留当前结果，允许重试保存，不重新生成、不重复插入。
- 详情页支持保存确认、收藏、下载本地 SVG、分享、公开/取消公开及确认删除。只有本人能看到原文和管理操作；原文默认折叠。
- 我的作品和收藏采用画廊，手机单列/双列；个人空间显示作品、收藏及公开作品数量。没有作品时提供安静的空状态。
- 广场只读取公开投影：图片、短句、日期、昵称与点赞数。公开详情使用 `?view=public`，即使作者本人打开也不展示原文、分析或提示词。
- 收藏和点赞按模拟用户记录，重复点击可取消。删除清理收藏、点赞和广场引用；取消公开后其他用户不再可见。跨标签页通过 storage 事件刷新。
- 本地数据采用版本化结构，遇到损坏或不支持的版本会提示错误，不自动清空或覆盖。此阶段没有云端同步、备份或自动迁移。
- 无真实 AI 请求，无需 Key 或 `.env` 即可运行，不产生 API 费用。

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
lib/storage/          Repository 接口、LocalStorage Mock 实现、统一 service
types/                核心业务类型
tests/                分析、生成、认证与 Repository 测试
scripts/              输出分析与提示词的人工检查脚本
public/mock/artworks/ 6 张 4:5 本地 SVG 占位作品
docs/plans/           本次设计范围
output/playwright/    本地浏览器检查截图（Git 忽略）
```

原型 Phase 1–13 与商业化 Phase 1–6 已完成，包括一次重新表达、分享卡片、购买记录、Mock Analytics 和仅开发环境可用的 Debug。没有会员、订阅、大作品包、单次付费、比例商城或高级风格商城。服务端工厂读取 `TEXT_AI_PROVIDER`、`IMAGE_AI_PROVIDER`，默认均为 `mock`。真实 Provider 仍明确报未实现错误，不会发出外部请求；API Key 和 DATABASE_URL 仍未使用。架构边界见 `lib/README.md`。

本地 HTTP 路由不是外部 AI API。文字只发往当前应用服务器处理，服务器不写数据库；生成结果由浏览器 Repository 保存。Mock 登录和权限控制只是原型行为，不是服务端真实身份认证，也不加密 LocalStorage。上线真实服务前需加入服务端会话与权限校验。

分享优先 Web Share，不支持时复制链接。公开只改变本浏览器数据状态，链接暂不能跨设备或跨浏览器访问。清除本站浏览器数据会删除作品。请始终使用同一地址访问：`localhost:3000` 与 `127.0.0.1:3000` 属于不同存储来源。

设置 `.env.local` 中的 `MOCK_GENERATION_FAIL_STAGE=painting`（也可为 `understanding` / `shaping`）并重启服务，可稳定复现失败；清空配置后可重试成功。原始错误仅在开发环境日志中显示，不打印输入文字。

重建本地图片可运行 `node scripts/create-mock-artworks.mjs`，结果确定且无需网络。

## 本次检查

- Phase 1 的生产构建通过，首页已启动检查。
- Phase 2 检查 375px、1440px；截图见 `output/playwright/`。
- 浏览器检查：空输入、单字符、纯空格禁用；Enter / Shift+Enter 换行；提交反馈；1000 字符上限；长文本内部滚动；清空后提示保持一致；手机菜单 Escape 关闭并返回焦点。

Phase 3–5 的验证记录及人工案例检查见 `docs/phase-3-5-validation.md`。本次变更文件列表见 `CHANGES.md`。

Phase 6–8 验证见 `docs/phase-6-8-validation.md`，测试已扩展至 29 项。

Phase 9–12 验证见 `docs/phase-9-12-validation.md`，当前 37 项测试全部通过，覆盖持久化、公开隐私、权限、收藏点赞、删除和存储故障。

Phase 13 与最终验收见 `docs/phase-13-final-validation.md`，覆盖 375–1920px、键盘与减少动画、空状态、错误恢复、导航、完整流程 A–F、LocalStorage 数据一致性、TypeScript 和生产构建。

商业化 Phase 1 验证见 `docs/commerce-phase-1-validation.md`。当前 44 项测试全部通过，新增覆盖免费发放、消费顺序、权限判断、幂等扣减、退款、失败不扣减和损坏存储保护。

商业化 Phase 2 验证见 `docs/commerce-phase-2-validation.md`。当前 48 项测试全部通过，新增覆盖 Purchase 状态、支付确认、购买入账幂等、入账失败重试、无效商品与损坏存储保护。

商业化 Phase 3 验证见 `docs/commerce-phase-3-validation.md`。当时 52 项测试全部通过，新增覆盖 entitlement 映射、完整 Session、候选作品、哲学内容和旧作品兼容。

商业化 Phase 4 验证见 `docs/commerce-phase-4-validation.md`。当时 55 项测试全部通过，覆盖一次重新表达、原作品保留和两种分享卡片。

商业化 Phase 5 验证见 `docs/commerce-phase-5-validation.md`。当时 58 项测试全部通过，覆盖 Analytics 白名单、购买记录和仅开发环境可用的 Debug。

商业化 Phase 6 最终验收见 `docs/commerce-phase-6-validation.md`。60 项测试、Lint、TypeScript 与生产构建通过；生产环境 `/debug` 返回 404。
