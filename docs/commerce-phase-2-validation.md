# 商业化 Phase 2 验证

## 完成范围

- 新增 `/pricing`，只呈现「初心作品包」：¥19.9 / 5 次完整创作。
- 免费与付费额度均为 0 时，首页生成按钮打开 `UnlockCreationModal`。
- 用户可以关闭付费墙继续编辑原文，也可以进入明确标注为开发模拟的 `MockCheckoutModal`。
- 引入 `PaymentProvider`、`MockPaymentProvider`、`PaymentService` 和版本化 `Purchase` 存储。
- 模拟购买成功后增加 5 次完整创作，并自动用购买前的 draft 继续生成。
- `/me` 低调显示免费额度；存在付费额度时同时显示完整创作额度。

## 自动检查

- `npm test`：48 / 48 通过。
- `npm run lint`：通过，无警告。
- `npx tsc --noEmit`：通过。
- `npm run build`：通过；Next.js 16.3.6 完成 TypeScript、13 个页面生成与路由产出，包含 `/pricing`。

## 浏览器验收

使用 Chromium 分别检查 375 × 812 与 1440 × 1000：

1. 以已登录且额度为 0 的用户在首页输入文字，点击生成后出现 Paywall。
2. 关闭 Paywall，输入框仍保留完整原文；再次打开后进入 Mock Checkout。
3. Checkout 明确显示不会产生真实费用，仅有当前唯一商品与「模拟购买成功」操作。
4. 模拟完成后 `untitled_purchases_v1` 产生一条 `paid` Purchase；`untitled_commerce_v1` 增加一条 +5 的 purchase 流水。
5. 页面自动回到生成流程并成功进入作品详情；作品折叠区保留购买前原文。
6. 本次生成按既有流程扣减 1 次，完整创作余额由 5 变为 4。
7. `/me` 显示免费创作 0 次、完整创作 4 次；刷新后仍为 4，Purchase 仍为 `paid`。
8. `/pricing` 在手机与桌面尺寸下均可访问，导航、商品信息、价格、次数和 Mock 说明完整。

## 数据边界

- Purchase 使用 `untitled_purchases_v1`，结构为 `{ version: 1, purchases: Purchase[] }`。
- 额度及流水继续使用 Phase 1 的 `untitled_commerce_v1`，没有重构现有生成与扣减流程。
- Purchase.id 是购买额度流水的幂等键；重复确认同一购买不会重复增加额度。
- draft 继续由根布局 AuthState Context 保存，不写入 URL 或支付记录。
- 本阶段无真实支付、会员、订阅、大作品包、单次付费、Phase 3–6 功能。
