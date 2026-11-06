# 文件变更记录

## 商业化 Phase 6 最终验收

- 修改 `components/commerce/mock-checkout-modal.tsx`：失败重试复用原订单；同步提交锁避免连续提交。
- 修改 `tests/commerce.test.ts`：增加保存后扣减失败幂等恢复，以及收藏/公开/删除不改额度与 Session 恢复测试。
- 新增 `docs/commerce-phase-6-validation.md`：37 项验收、已知 Mock 边界、未来服务替换位置和 build 结果。
- 修改 `README.md`、`FUTURE.md`、本文件：同步阶段状态，未实现未来功能。
- 生成 `output/playwright/phase6-*` 浏览器截图和下载证据。
- 验证：60 项测试、Lint、TypeScript、生产 build 通过；生产 `/debug` 实际返回 404。

## 本次商业化 Phase 5

新建：

- `lib/analytics/types.ts`、`mock-provider.ts`、`service.ts`
- `lib/debug/service.ts`
- `components/debug/debug-panel.tsx`
- `components/profile/purchase-history.tsx`
- `app/debug/page.tsx`、`app/me/purchases/page.tsx`
- `tests/phase5.test.ts`
- `docs/commerce-phase-5-validation.md`

修改：

- `lib/payment/provider.ts`、`mock-provider.ts`、`payment-service.ts`：购买记录按当前 Mock 用户查询。
- `lib/commerce/mock-creation-balance-repository.ts`：开发调试可调整余额，差额写入带 debug 前缀的模拟流水。
- `lib/ai/generation-client.ts`、`lib/creation/regeneration-service.ts`：接入一次性失败开关和重新表达行为记录。
- `lib/auth/auth-service.ts`：允许安全返回 `/me/purchases`。
- `components/create/generation-state.tsx`、`components/commerce/unlock-creation-modal.tsx`、`components/artwork/artwork-actions.tsx`、`artwork-detail.tsx`、`share-card-modal.tsx`：在既有动作上记录固定行为名。
- `components/profile/profile-page.tsx`、`app/globals.css`：增加购买记录入口；开发环境显示调试入口。
- `README.md`、`FUTURE.md`：记录商业化 Phase 5 边界。

本轮仅完成商业化 Phase 5。未执行 Phase 6，未实现新商品、会员或实物业务。Analytics 不联网、不保存私人内容。

## 本次商业化 Phase 4

新建：

- `lib/creation/regeneration-service.ts`、`regeneration.ts`、`share-card.ts`
- `components/artwork/share-card-modal.tsx`
- `tests/regeneration.test.ts`
- `docs/commerce-phase-4-validation.md`

修改：

- `types/artwork.ts`、`types/generation.ts`：增加重新表达结果和已使用标记。
- `lib/ai/generation-service.ts`、`app/api/generate/route.ts`：重新表达沿用既有生成链路。
- `lib/storage/artwork-repository.ts`、`mock-artwork-repository.ts`、`lib/creation/session-validation.ts`：一次写入追加新表达并标记已使用，存储层拒绝重复追加。
- `components/artwork/artwork-actions.tsx`、`artwork-detail.tsx`、`app/globals.css`：完整创作可重新表达一次，并可预览、下载和分享卡片。

本轮仅完成商业化 Phase 4。未执行 Phase 5–6，未增加 Analytics、购买记录页或 Debug。重新表达不扣创作额度，分享卡片不包含原始私人文字。

## 本次商业化 Phase 3

新建：

- `config/creation-entitlements.ts`
- `lib/creation/session-validation.ts`
- `tests/entitlement.test.ts`
- `docs/commerce-phase-3-validation.md`

修改：

- `types/commerce.ts`：新增 CreationEntitlement 与 free/full tier。
- `types/ai.ts`：新增 ArtworkAspectRatio 与 ProviderUsage 预留。
- `types/artwork.ts`、`types/generation.ts`：新增主作品、候选版本、哲学内容、CreationSession、cost 及生成权益字段。
- `data/philosophy-themes.ts`：为 15 个现有哲学主题补充原创说明。
- `lib/ai/text/types.ts`、`mock-provider.ts`、`unavailable-provider.ts`：沿用 Provider 接口增加哲学说明生成。
- `lib/ai/image/types.ts`、`mock-provider.ts`：沿用现有 MockImageProvider 支持确定性候选版本。
- `lib/ai/generation-service.ts`、`generation-client.ts`、`app/api/generate/route.ts`：按 entitlement 生成并传输完整 CreationSession。
- `components/create/generation-state.tsx`：根据现有 CreationPermission 的额度来源选择 free/full。
- `lib/storage/mock-artwork-repository.ts`：保存并校验新 Session，同时兼容旧 Artwork。
- `components/artwork/artwork-detail.tsx`、`app/globals.css`：完整创作详情展示 3 个候选和哲学说明。
- `tests/generation.test.ts`、`text-ai.test.ts`、`artwork-repository.test.ts`：扩展权益、Provider、路由和旧数据兼容验证。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：记录商业化 Phase 3 边界。

本轮仅完成商业化 Phase 3。未执行 Phase 4–6，未接真实 AI，也未增加分享卡片、换一种表达、Analytics、购买记录、Debug、会员或商城。

## 本次商业化 Phase 2

新建：

- `app/pricing/page.tsx`
- `components/commerce/unlock-creation-modal.tsx`、`mock-checkout-modal.tsx`
- `components/commerce/pricing-experience.tsx`、`use-creation-balance.ts`
- `lib/payment/types.ts`、`provider.ts`、`mock-provider.ts`、`payment-service.ts`
- `tests/payment.test.ts`
- `docs/commerce-phase-2-validation.md`

修改：

- `types/commerce.ts`：增加 Purchase 及支付状态类型。
- `lib/commerce/creation-balance-repository.ts`、`mock-creation-balance-repository.ts`、`creation-balance-service.ts`：支持带 Purchase ID 的幂等购买入账。
- `components/home/thought-input.tsx`：额度耗尽时打开 Paywall，保留 draft；购买后自动回到 `/create` 继续原创作。
- `components/profile/profile-page.tsx`：低调显示免费额度和完整创作额度。
- `lib/auth/auth-service.ts`：允许安全返回 `/pricing`。
- `app/globals.css`：增加 Pricing、Paywall、Mock Checkout、余额及手机端样式。
- `tests/auth.test.ts`：覆盖 Pricing 安全返回路径。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：记录商业化 Phase 2 边界。

本轮仅完成商业化 Phase 2。未执行 Phase 3–6，未接真实支付，未创建会员、订阅、大作品包或单次付费 UI。

## 本次商业化 Phase 1

新建：

- `config/commerce.ts`、`types/commerce.ts`
- `lib/commerce/creation-balance-repository.ts`、`mock-creation-balance-repository.ts`
- `lib/commerce/creation-balance-service.ts`、`creation-policy-service.ts`
- `lib/commerce/creation-completion-service.ts`、`creation-completion.ts`、`commerce-service.ts`
- `tests/commerce.test.ts`
- `docs/commerce-phase-1-validation.md`

修改：

- `lib/auth/auth-service.ts`：注册或首次 Mock 登录时幂等初始化 3 次免费创作。
- `components/home/thought-input.tsx`：进入生成前检查创作权限，无额度时保留原文并显示占位提示。
- `components/create/generation-state.tsx`：低调显示余额，先保存作品再按作品 ID 幂等扣减，保存重试不重复扣减。
- `app/globals.css`：增加一条克制的创作次数提示样式。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：记录商业化 Phase 1 边界。

未实现 Phase 2–6；未增加 Pricing、Paywall、支付、Purchase 页面、分享卡片、Analytics 或 Debug。

## 本次 Phase 13 与最终验收

新建：

- `docs/phase-13-final-validation.md`

修改：

- `app/globals.css`：提高次级文字、哲学占位提示、页边注记和生成步骤的颜色对比度。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：记录 Phase 13 完成状态与最终验收结果。

未新增产品功能、运行依赖或真实 API。浏览器验收截图位于 `output/playwright/`。

## 本次 Phase 9–12

新建：

- `lib/storage/mock-artwork-repository.ts`、`lib/storage/artwork-service.ts`
- `components/artwork/artwork-detail.tsx`、`artwork-actions.tsx`、`use-artwork-query.ts`
- `components/gallery/gallery-grid.tsx`、`collection-page.tsx`
- `components/profile/profile-page.tsx`、`components/auth/require-auth.tsx`、`components/ui/confirm-dialog.tsx`
- `app/artwork/[id]/page.tsx`、`app/gallery/page.tsx`
- `app/me/layout.tsx`、`app/me/page.tsx`、`app/me/artworks/page.tsx`、`app/me/favorites/page.tsx`
- `app/not-found.tsx`、`tests/artwork-repository.test.ts`
- `docs/plans/2026-09-24-phase-9-12-design.md`、`docs/phase-9-12-validation.md`

修改：

- `lib/storage/artwork-repository.ts`：扩展公开投影、收藏、点赞、幂等保存接口。
- `components/create/generation-state.tsx`：自动私密保存、保存故障重试、完成动画后进入详情。
- `components/layout/header.tsx`、`mobile-nav.tsx`、`components/auth/account-control.tsx`：接通作品、广场、收藏与个人页入口。
- `lib/auth/auth-service.ts`、`tests/auth.test.ts`：新增站内安全返回地址。
- `app/globals.css`：新增画廊、详情、个人页、弹窗样式。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：更新当前实现范围和本地存储边界。

未新增运行依赖。Next.js 自动维护的类型文件和构建缓存、浏览器检查产物不属于功能代码。

## 本次 Phase 6–8

新建：

- `app/create/page.tsx`、`app/api/generate/route.ts`
- `components/create/generation-state.tsx`
- `lib/ai/image/mock-provider.ts`、`lib/ai/image/provider.ts`
- `lib/ai/generation-service.ts`、`lib/ai/generation-client.ts`
- `lib/utils/preload-image.ts`、`types/generation.ts`、`config/generation.ts`
- `data/mock-artworks.ts`、`scripts/create-mock-artworks.mjs`
- `public/mock/artworks/open-field.svg`、`crossroads.svg`、`quiet-room.svg`、`afternoon.svg`、`mist.svg`、`shore.svg`
- `tests/generation.test.ts`、`tests/generation-client.test.ts`
- `docs/plans/2026-09-23-phase-6-8-design.md`、`docs/phase-6-8-validation.md`

修改：

- `components/home/thought-input.tsx`：提交进入生成页，未登录先登录再继续；布局不变。
- `lib/auth/auth-service.ts`：允许安全返回 `/create`。
- `lib/ai/image/types.ts`：更新接口说明。
- `app/globals.css`：追加生成画布、完成、错误与减少动画样式。
- `.env.example`：增加本地失败模拟开关。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：更新阶段和边界说明。

本地检查截图与 `.next` 构建缓存不纳入源码。

## 本次 Phase 3–5

新建：

- `app/login/page.tsx`、`app/register/page.tsx`
- `components/auth/auth-state.tsx`、`account-control.tsx`、`auth-form.tsx`、`login-form.tsx`、`register-form.tsx`
- `lib/auth/auth-provider.ts`、`mock-auth-provider.ts`、`auth-service.ts`
- `types/user.ts`、`types/ai.ts`、`types/artwork.ts`
- `lib/ai/text/types.ts`、`provider.ts`、`mock-provider.ts`、`unavailable-provider.ts`、`deepseek-provider.ts`、`openai-provider.ts`、`gemini-provider.ts`
- `lib/ai/image/types.ts`、`lib/ai/errors.ts`、`lib/ai/prompt-builder.ts`
- `lib/storage/artwork-repository.ts`（仅接口）
- `data/philosophy-themes.ts`、`data/art-styles.ts`、`data/mock-quotes.ts`
- `tests/fixtures/emotion-cases.ts`、`tests/text-ai.test.ts`、`tests/auth.test.ts`
- `scripts/inspect-text-ai.ts`、`docs/phase-3-5-validation.md`

修改：

- `app/layout.tsx`：挂载 AuthState、补 Next.js 平滑滚动标记。
- `app/globals.css`：仅追加登录/注册和账号入口样式。
- `components/home/thought-input.tsx`：增加登录检查、跨登录导航保留输入、恢复输入高度；版式未变。
- `components/layout/header.tsx`、`mobile-nav.tsx`：增加登录/退出入口。
- `components/layout/footer.tsx`：返回链接支持从登录页回到首页。
- `package.json`、`package-lock.json`：添加 tsx 测试依赖、test 和 inspect:text 命令。
- `README.md`、`FUTURE.md`、`lib/README.md`、`CHANGES.md`：更新阶段状态与架构说明。
- `next-env.d.ts`：Next.js 构建/开发工具自动维护。

本地截图：`output/playwright/login-375.png`、`register-375.png`、`login-1440.png`（Git 忽略）。

## 上次 Phase 1–2

开始时项目目录为空，因此以下均为本次新建文件，没有修改已有用户文件。

## 工程配置

- `.gitignore`
- `.env.example`
- `package.json`
- `package-lock.json`（npm 安装生成）
- `tsconfig.json`
- `next-env.d.ts`（初始化后由 Next.js 更新）
- `postcss.config.mjs`
- `eslint.config.mjs`
- `AGENTS.md`、`CLAUDE.md`（Next.js 开发服务器自动生成）

## 页面与组件

- `app/layout.tsx`
- `app/page.tsx`（Phase 1 基础页，Phase 2 更新为完整首页）
- `app/globals.css`（Phase 1 基础样式，Phase 2 增补首页和响应式样式）
- `app/icon.svg`
- `components/layout/header.tsx`
- `components/layout/mobile-nav.tsx`
- `components/layout/footer.tsx`
- `components/home/hero.tsx`
- `components/home/thought-input.tsx`
- `components/home/philosophy-placeholder.tsx`
- `components/home/selected-works.tsx`
- `config/site.ts`
- `data/relaxing-prompts.ts`

## 文档和目录预留

- `README.md`
- `FUTURE.md`
- `CHANGES.md`
- `lib/README.md`
- `docs/plans/2026-09-23-phase-1-2-design.md`
- `lib/ai/text/.gitkeep`
- `lib/ai/image/.gitkeep`
- `lib/auth/.gitkeep`
- `lib/storage/.gitkeep`
- `types/.gitkeep`
- `public/mock/artworks/.gitkeep`

## 本地检查产物（Git 忽略）

- `output/playwright/home-375.png`
- `output/playwright/home-1440.png`
- `.playwright-cli/` 中的快照和控制台日志
- `.next/` 构建缓存、`node_modules/` 安装依赖
