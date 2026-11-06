# 商业化 Phase 1 验证记录

## 范围

本阶段只完成商业配置、额度类型、额度与流水服务、免费额度发放、创作权限判断、成功保存后扣减、失败不扣减、创作页低调展示和 LocalStorage 持久化。

未实现 Pricing、Paywall、支付、Purchase、完整创作权益、分享卡片、Analytics、Debug 或会员功能。

## 业务规则

- 新 Mock 用户首次初始化获得 `freeRemaining = 3`、`paidRemaining = 0`。
- 免费发放以用户记录是否已经存在为幂等依据，重复登录、刷新或重复调用不会再次赠送。
- 创作权限按免费额度、付费额度、无额度的顺序返回 `free`、`paid`、`none`。
- 成功生成后先保存 Artwork，再以 `Artwork.id` 作为 sessionId 消耗一次额度。
- 同一个 sessionId 重试保存和完成时不会重复扣减。
- 生成失败或作品保存失败不会调用额度消费。
- 消费顺序固定为免费额度优先，付费额度其次。
- refund 会退回原来消费的额度来源，并保持幂等。

## 持久化

额度与交易流水保存在版本化键 `untitled_commerce_v1` 中：

```text
version
balances[userId]
transactions[]
```

一次额度变化和对应流水使用同一次 LocalStorage 写入。读取时会验证版本、余额和流水结构；损坏数据会保留原值并显示错误，不会静默覆盖。

## 浏览器验收

- 首页输入 → 注册 → 返回创作页，显示“还有 3 次免费创作”。
- 作品保存成功后余额为 `freeRemaining = 2`，并产生一条 `creation -1` 流水。
- 流水 sessionId 与保存后的 Artwork.id 一致。
- 刷新后余额仍为 2。
- 模拟生成接口失败后余额仍为 2。
- 手动设置额度为 0 后，首页阻止进入生成流程，原输入文字完整保留。
- 375px 创作页余额提示保持低调，没有改动 Header 或首页结构。

截图：`output/playwright/commerce-phase1-generation-375.png`。

## 自动化检查

- `npm test`：44/44 通过。
- `npm run lint`：通过。
- `npx tsc --noEmit`：通过。
- `npm run build`：通过。

