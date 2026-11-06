# UNTITLED — 商业化 Phase 6 最终验收

验收日期：2026-09-25～2026-09-26。范围：现有 Mock 商业链路；未实现 FUTURE.md 的功能。

结论：下列 37 项在当前单浏览器 Mock 范围内通过对应的浏览器测试、自动化测试或代码检查。不是生产支付、真实 AI、跨设备同步或真实手机设备认证。

## 完成的商业链路

新用户注册 → 免费 3 次 → 第一次成功后 2 次 → 模拟失败仍为 2 次 → 重试成功剩 1 次 → 第三次成功剩 0 次 → 第四次提交出现 Paywall → 关闭保留原文 → Mock 购买 ¥19.9 / 5 次 → paidRemaining = 5 → 自动继续原文 → 成功后 paidRemaining = 4。

完整创作保存主作品、3 个候选、哲学说明和原创短句。首次重新表达不扣次数，原作品不被覆盖；第二次被 UI 和服务层禁止。收藏、公开/私密、下载、分享和删除均不修改额度账本。

## 逐项验收

| 编号 | 检查 | 结果与证据 |
| --- | --- | --- |
| 1 | 新用户免费 3 次 | 通过；两次独立浏览器注册读回 3/0；自动化验证重复初始化不重复赠送 |
| 2 | 第一次成功剩 2 次 | 通过；真实 UI 生成后读取本地余额 |
| 3 | 失败不扣次数 | 通过；Debug 下一次失败，余额仍为 2，错误页可重试 |
| 4 | 第三次成功免费为 0 | 通过；连续 UI 创作及余额断言 |
| 5 | 第四次出现 UnlockCreationModal | 通过；余额耗尽后提交显示解锁弹窗 |
| 6 | 关闭弹窗文字保留 | 通过；输入值逐字比对 |
| 7 | Mock 购买初心作品包 | 通过；仅 ¥19.9 / 5 次产品 |
| 8 | 购买后 paidRemaining = 5 | 通过；成功提示出现时读取余额 |
| 9 | 自动返回继续原文 | 通过；无需再次点击生成，成品 originalText 与 draft 一致 |
| 10 | 成功后 paidRemaining = 4 | 通过；作品与余额同时检查 |
| 11 | 首次重新表达不扣次数 | 通过；前后账本字符串完全一致 |
| 12 | 第二次重新表达禁止 | 通过；按钮禁用，服务层测试拒绝重复与并发调用 |
| 13 | 收藏不扣次数 | 通过；浏览器和回归测试 |
| 14 | 删除不扣次数 | 通过；浏览器删除后空状态、账本不变，引用清理测试 |
| 15 | 公开/私密不扣次数 | 通过；UI 双向切换及账本比对 |
| 16 | 下载已有作品不扣次数 | 通过；捕获 SVG 下载，账本不变 |
| 17 | 刷新余额保持 | 通过；刷新前后原始存储一致 |
| 18 | 刷新购买记录保持 | 通过；存储比对及购买记录页刷新仍显示已完成 |
| 19 | Artwork / CreationSession 刷新保持 | 通过；含原版本、重新表达、候选与 regenerateUsed 的存储完全一致 |
| 20 | Paywall 不清空 draft | 通过；关闭、重新打开、购买续作均保留输入 |
| 21 | free / full 权益 | 通过；免费无付费附加权益，完整创作有 3 候选、说明、分享卡片和 1 次重新表达；类型与规则测试 |
| 22 | Pricing 风格 | 通过；桌面双栏、手机单栏，暖纸色、克制排版、单产品，无订阅或促销扩展 |
| 23 | 分享卡片 | 通过；Editorial / Immersive 1080×1350 PNG 下载并查看；私密链接禁止复制，公开链接复制成功；系统分享支持/不支持分支以浏览器替身验证 |
| 24 | Analytics 隐私 | 通过；仅固定事件名和 occurredAt；26 条浏览器事件无 originalText、Prompt 或测试私人文字；自动化验证任意额外载荷不会记录 |
| 25 | Debug 仅开发环境 | 通过；开发页可用；最新生产构建实际 HTTP 404，个人页无入口；生产调试操作和失败开关测试 |
| 26 | 手机端 | 通过；Chromium 375×812 视口检查详情、分享、Pricing、结算、购买历史和菜单；无横向溢出 |
| 27 | 桌面端 | 通过；Chromium 1440×1000 视口检查详情和 Pricing，完成商业链路操作 |
| 28 | Empty State | 通过；我的作品、收藏、广场、购买记录及无 draft 的生成页 |
| 29 | Loading State | 通过；生成 aria-busy 与动画截图、结算 pending 禁用、分享预览准备状态代码检查 |
| 30 | Error State | 通过；生成失败重试、结算写入失败重试、损坏购买记录提示与恢复重试；损坏数据不被覆盖 |
| 31 | Navigation | 通过；注册回创作、作品详情、首页、手机收藏菜单、个人页、Pricing、购买记录及删除返回作品列表 |
| 32 | LocalStorage 一致性 | 通过当前流程；余额/账本同键写入，购买 ID 和创作 ID 幂等，刷新保持、删除清理引用；跨存储键中断限制见下文 |
| 33 | TypeScript | 通过；npx tsc --noEmit 和 build 内置检查 |
| 34 | 无无关重构 | 通过；业务代码只修复现有 MockCheckoutModal，未改首页或生成架构 |
| 35 | 无真实支付 | 通过；仍注入 MockPaymentProvider，无外部支付调用 |
| 36 | 无真实 AI | 通过；仅本地 /api/generate，文字和图片均 Mock；真实供应商类只是显式报错的预留 |
| 37 | 无会员或订阅 | 通过；产品配置与 UI 保持单一初心作品包 |

## 修复与变更

- `components/commerce/mock-checkout-modal.tsx`：保存本次弹窗的 paymentId；验证付款或入账失败后重试同一订单。增加同步提交锁，防止 React 状态更新前的连续提交。
- 实际故障注入：订单已 paid，向 `untitled_commerce_v1` 的首次写入抛错；弹窗重试后订单仍只有 1 笔，额度仅增加 5 次，自动创作后剩 4 次。
- `tests/commerce.test.ts`：新增 2 项回归，覆盖作品已保存但扣减失败后的幂等重试，以及收藏/可见性/删除不改账本、Repository 重建恢复 Session。
- 新增本报告；更新 `README.md`、`FUTURE.md`、`CHANGES.md` 的阶段状态。FUTURE 仅更新状态，没有实现其中功能。
- 浏览器证据位于 `output/playwright/phase6-*`，包括详情、Pricing、购买记录、结算、生成错误/加载截图，两个分享 PNG 和作品 SVG。测试使用独立浏览器，不清除用户实际浏览器数据。

## 自动化和 Build

- `npm test`：60/60 通过。
- `npm run lint`：通过。
- `npx tsc --noEmit`：通过。
- `npm run build`：通过；Next.js 16.3.6，编译、TypeScript、15 个路由构建成功。
- 用本次产物执行 `npm run start -- --port 3003` 后，验证 `/debug` 404 和个人页隐藏 Debug。
- 开发环境图片 LCP 性能提示仍存在；不影响功能或 build。模拟生成失败和预期 404 会产生对应控制台错误，不属于未处理的业务失败。

## 仍为 Mock 的模块

MockAuthProvider、MockTextAIProvider、MockImageProvider、MockArtworkRepository、MockCreationBalanceRepository、MockPaymentProvider、MockAnalyticsProvider。广场与购买记录也只反映当前浏览器数据；图片是本地 SVG，占位画面并非真实 AI 成图。

## 真实服务的替换边界（本轮不实现）

| 未来接入 | 替换/扩展位置 | 保留与补充 |
| --- | --- | --- |
| 数据库与身份 | `lib/storage/mock-artwork-repository.ts`、`lib/commerce/mock-creation-balance-repository.ts`、`lib/auth/mock-auth-provider.ts`；迁移 MockPaymentProvider 内的 Purchase 存储 | 保留 Repository / Service 契约；服务器鉴权，作品/Session/余额/流水/订单持久化，数据库事务、唯一幂等键、并发控制与迁移 |
| 真实文本 AI | `lib/ai/text/types.ts` 的 TextAIProvider；`lib/ai/text/provider.ts` 工厂和供应商实现 | 沿用 GenerationService 与 PromptBuilder，在服务端接入；完善错误、超时、usage/cost |
| 真实图片 AI | `lib/ai/image/types.ts` 的 ImageAIProvider；`lib/ai/image/provider.ts` 工厂 | 替换 MockImageProvider，增加真实图片持久化；目前 Repository 图片校验限定本地 Mock URL，接入时也需适配 |
| 真实支付 | `lib/payment/provider.ts` 的 PaymentProvider；`lib/payment/payment-service.ts` 当前注入位置 | 替换 MockPaymentProvider；服务端创建订单、验签回调和对账；以支付成功事件在数据库事务内幂等入账，不能信任浏览器余额或客户端完成按钮 |

## 当前验收边界

- LocalStorage 按浏览器和来源隔离，不提供跨设备分享访问、服务器鉴权或防篡改。Mock 账号统一使用 demo-user，不代表真实多用户系统。
- draft 保存在根布局 Context，SPA 登录/Paywall/Checkout 往返不丢；硬刷新尚未完成的草稿会清空。完成作品的原文和 Session 会持久化。
- 多个 LocalStorage 键不是数据库事务。写入失败后在原页面重试已验证幂等；如果在“作品已保存但未扣次”或“订单已 paid 但未入账”中途关页/刷新，尚无自动对账恢复。本轮弹窗重试修复不等于跨刷新恢复；生产接入必须用事务和服务端对账解决。
- 未承诺跨标签页同时抢最后一次额度的事务隔离；本轮验证的是单浏览器顺序流程、服务实例内重复调用与重新表达并发保护。
- 手机端采用浏览器视口模拟，未做真机 Safari/Android 全机型测试。系统分享通过替身验证接口调用与降级，未向外部发送作品。

商业化 Phase 6 验收结束，未继续未来路线开发。
