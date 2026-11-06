# 商业化 Phase 3 验证

## 完成范围

- 新增集中管理的 `CreationEntitlement`，支持 `free` 与 `full`。
- 免费创作保存 1 张主作品、原创哲学短句和基础主题信息。
- 完整创作保存 1 张主作品、3 张候选作品、原创哲学短句和哲学主题说明。
- 新增 `ArtworkAspectRatio`，V1 固定使用 4:5；没有比例选择或商城。
- Artwork 兼容外层新增 CreationSession，包含权益快照、主作品、候选作品和哲学内容。
- `cost` 与 `providerUsage` 是可选类型预留，Mock 阶段保持 undefined。
- 候选图继续由 MockImageProvider 生成；说明和短句继续由 MockTextAIProvider 生成。

## 权益规则

- Phase 1 的 CreationPolicyService 仍决定额度来源。
- `source: free` 映射为 `tier: free`。
- `source: paid` 映射为 `tier: full`。
- 所有能力开关和候选数量只在 `config/creation-entitlements.ts` 定义。
- 隐私、保存、收藏、公开/私密和删除逻辑没有加入付费限制。

## 自动检查

- `npm test`：52 / 52 通过。
- `npm run lint`：通过，无警告。
- `npx tsc --noEmit`：通过。
- `npm run build`：通过；Next.js 16.3.6 完成 TypeScript 检查和 13 个页面生成。

## 浏览器验收

使用 1 次购买额度完成一次创作：

1. 页面将付费额度映射为 full entitlement。
2. 原生成动画、保存后扣费和详情跳转保持不变。
3. 详情显示主作品、3 张不同候选、主题名称、原创说明与原创短句。
4. LocalStorage 中 CreationSession 与 Artwork 同一次原子保存。
5. 成功保存后付费额度从 1 变为 0，仅扣 1 次完整创作。
6. 刷新详情后候选和哲学说明仍然存在。
7. 375px 手机端结构完整，浏览器控制台无错误。

## 兼容边界

- 现有 Artwork 顶层 `imageUrl`、`quote`、分析、Prompt 和可见性字段保留，原页面与广场投影无需改写。
- Phase 3 之前没有 CreationSession 的旧作品仍能读取和显示。
- 公开投影继续只暴露既有公开字段，不泄露原文、分析、Prompt、候选 Session 或成本预留。
- 本阶段未实现分享卡片、换一种表达、Analytics、Purchase History、Debug、会员、比例商城或高级风格商城。
