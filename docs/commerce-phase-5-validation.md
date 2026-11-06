# Phase 5 — Analytics / Purchases / Debug

## 文件清单

新增：lib/analytics/types.ts、mock-provider.ts、service.ts；lib/debug/service.ts；components/debug/debug-panel.tsx；components/profile/purchase-history.tsx；app/debug/page.tsx；app/me/purchases/page.tsx；tests/phase5.test.ts；本文件。

修改：lib/payment/provider.ts、mock-provider.ts、payment-service.ts；lib/commerce/mock-creation-balance-repository.ts；lib/ai/generation-client.ts；lib/creation/regeneration-service.ts；lib/auth/auth-service.ts；components/create/generation-state.tsx；components/commerce/unlock-creation-modal.tsx；components/artwork/artwork-actions.tsx、artwork-detail.tsx、share-card-modal.tsx；components/profile/profile-page.tsx；app/globals.css；README.md；FUTURE.md。

## Analytics 隐私与事件语义

AnalyticsEvent 提供 12 个固定行为名，AnalyticsProvider 只有 track(event) 接口。MockAnalyticsProvider 运行时再次白名单检查，只输出 event 和 occurredAt，不接收任意 payload。不记录原文、Prompt、短句、情绪、哲学说明、图片、用户 ID、购买 ID 或 URL；不联网、不写 Analytics LocalStorage。开发环境 console.info，生产环境静默；Analytics 异常不阻断业务。

- creation_started：权限通过、开始一次正式创作。
- creation_completed：作品保存后额度消费成功；幂等消费不重复记录。
- creation_failed：生成、加载或首次保存失败；用户取消不算失败。
- free_creation_used：成功扣除免费额度。
- free_quota_exhausted：最后一次免费额度成功耗尽。
- paywall_viewed：付费墙打开，StrictMode 不重复记录。
- checkout_started：创建 Mock 结账成功。
- purchase_completed：购买额度成功入账；幂等入账不重复记录。
- artwork_downloaded：用户触发作品或卡片下载（浏览器无法确认用户最终保存到磁盘）。
- share_card_created：卡片渲染成功。
- artwork_shared：系统分享 Promise 成功或复制链接成功；取消不记录。
- regeneration_used：新表达成功追加保存，不算新收费创作。

## 购买记录

/me/purchases 沿用 /me 登录保护，仅查询当前 Mock 用户的 Purchase，展示商品、金额、次数、日期和状态。读取已有 untitled_purchases_v1，不制造假订单。提供加载、空状态、错误与重试；刷新、窗口重新聚焦和其他标签存储更新时读取最新记录。

## Debug 使用

npm run dev 后登录，从 /me 的开发调试入口进入 /debug。可设置免费 3 次、免费 1 次、免费耗尽、已购买 5 次、全部耗尽。两个耗尽预设当前均为 0/0；已购买 5 次仅设置测试余额，不伪造 Purchase。

仅调整当前用户余额，保留作品和购买记录；差额记录为带 debug 前缀的模拟调整流水，不作为 Analytics 行为。
下一次失败使用当前标签 sessionStorage 一次性开关；生成时消费并清除，失败不扣额度，后续可正常重试。

生产环境 /debug 在服务端 notFound，页面与修改方法也有 NODE_ENV 防护；生产导航不显示入口，失败开关无效。

## 验证

- npm test：58/58 通过，包含 Analytics 白名单/生产静默、购买记录隔离/刷新/损坏保护、生产 Debug 禁用。
- TypeScript、Lint、npm run build：通过；生产构建生成 15 个页面。
- 浏览器验证 Debug 免费 1 次 → 下一次失败 → 余额仍为 1 → 重试成功。
- 浏览器验证购买记录空状态、Mock 购买后的已完成记录及刷新恢复。
- 生产 next start 单独端口验证 /debug HTTP 404。

只完成 Phase 5，Phase 6 未执行。FUTURE.md 已记录未来商业路线，未实现新商品、会员或实物业务。
