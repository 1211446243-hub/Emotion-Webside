# 业务边界（原型 Phase 1–13；商业化 Phase 1–6）

保持 UI → Service → Provider / Repository 的依赖方向。

- `auth/auth-service.ts` 是组合入口；AuthState、表单与账号控件只依赖统一服务，不实例化 Mock Provider。替换真实登录时在这一边界更换实现。
- `ai/text/types.ts` 定义接口；`mock-provider.ts` 提供确定性关键词分析；`provider.ts` 根据环境变量选择实现。真实供应商文件仅报错占位，未来在这些文件实现网络传输。
- `ai/prompt-builder.ts` 只将结构化分析转换为模型无关提示词，不接触 UI、存储或供应商。
- `ai/image/types.ts` 定义接口；MockImageProvider 按提示词选择本地图片，工厂在服务端读取环境变量。
- `storage/artwork-repository.ts` 定义持久化契约，增加公开投影、收藏列表、点赞和幂等保存生成结果的方法。
- `storage/mock-artwork-repository.ts` 实现版本化 LocalStorage，读取时验证结构，写入失败明确报错。所有权检查和隐私投影在 Repository 层完成。
- `storage/artwork-service.ts` 是组合入口，页面不读取 LocalStorage、不创建具体 Repository。查询通过订阅同标签写入和其他标签的 storage 事件更新。
- `commerce/creation-balance-repository.ts` 定义额度持久化契约；Mock 实现用 `untitled_commerce_v1` 原子保存余额变化与对应流水，并验证版本和数据结构。
- `commerce/creation-balance-service.ts` 是免费发放、购买额度、消费和退款的唯一业务入口；`creation-policy-service.ts` 统一判断免费、付费或无额度。
- `commerce/creation-completion-service.ts` 保证成功作品先保存，再以 Artwork.id 作为 sessionId 幂等扣减。生成失败或保存失败不会进入消费步骤。
- `payment/provider.ts` 定义结账、确认和 Purchase 查询契约；UI 和额度服务不实例化具体支付实现。
- `payment/mock-provider.ts` 只在浏览器 LocalStorage 中模拟 `pending → paid`，不调用网络，不产生真实费用；损坏数据不会被覆盖。
- `payment/payment-service.ts` 是支付组合入口：只有 Provider 返回 `paid` 后才增加额度，并以 Purchase.id 作为入账幂等键。支付成功但余额写入失败时可以安全重试。
- `config/creation-entitlements.ts` 是 free/full 权益的唯一规则来源；免费额度映射为 free，购买额度映射为 full。组件不自行拼装权益。
- `ai/generation-service.ts` 根据 entitlement 使用同一组 Mock Provider：始终生成主作品和原创短句，full 额外生成 3 个候选版本与哲学说明。
- `creation/session-validation.ts` 在流式传输和 LocalStorage 边界验证完整 CreationSession；旧 Artwork 可没有 Session，新生成结果必须携带有效 Session。
- CreationSession 内嵌 entitlement 快照、主作品、候选作品、哲学主题、短句与比例；`cost`、`providerUsage` 为可选预留，Mock 阶段保持 undefined。
- `creation/regeneration-service.ts` 只服务 full 权益的一次重新表达。成功结果追加为 `regeneratedExpression`，并与 `regenerateUsed=true` 同一次写入；失败不占用次数，也不扣创作额度。原主作品、候选和哲学说明保持不变。
- `creation/share-card.ts` 在浏览器本地绘制 1080×1350 分享卡片，只使用作品图、短句、日期和品牌名，不放入原始私人文字。私密作品不会因复制链接而自动公开。
- `analytics/service.ts` 只接收 12 个固定行为名。Mock 实现再做白名单检查，开发环境输出行为名和时间，生产环境静默；不接收任意载荷，不联网，不写入 LocalStorage。统计失败不阻断创作、支付或分享。
- `payment/payment-service.ts` 的购买查询只返回当前 Mock 用户的记录。`/me/purchases` 读取已有 `untitled_purchases_v1`，不制造订单。
- `debug/service.ts` 与 `/debug` 只在开发环境可用。它调整当前用户余额并保留作品与购买记录；下一次失败开关存在当前标签页，触发后清除。生产环境页面返回 404，修改方法和失败开关无效。
- `ai/generation-service.ts` 注入文字、图片 Provider，串联分析、提示词、图片、短句与作品对象创建；默认私密，不耦合 HTTP 或持久化。
- `app/api/generate/route.ts` 是本地 Mock 流式传输适配器，负责校验、Provider 装配、取消与友好错误。当前无真实登录会话、无外部请求。
- `ai/generation-client.ts` 是浏览器调用入口，解析分块 UTF-8 进度与完成事件，处理断流、取消与超时。
- `components/create/generation-state.tsx` 只依赖客户端 service，完成后保存私密作品并进入详情；存储失败保留生成结果、仅重试保存。离开时取消尚未完成的任务。
- 详情页私密读取与广场公开读取分开；公开页即使由本人访问也不会收到私密记录。点赞/收藏其他作者作品时也不返回对方的私密字段。

Mock 登录是浏览器原型状态，不作为真实服务端权限依据。真实接入时需要服务端认证与权限检查。作品公开模型显式排除原始文字、分析与提示词。
