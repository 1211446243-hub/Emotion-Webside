# 商业化 Phase 4

仅实现一次重新表达和分享卡片；Phase 5、6 未执行。

## 修改文件

新增：
- lib/creation/regeneration-service.ts
- lib/creation/regeneration.ts
- lib/creation/share-card.ts
- components/artwork/share-card-modal.tsx
- tests/regeneration.test.ts
- docs/commerce-phase-4-validation.md

修改：
- types/artwork.ts
- types/generation.ts
- lib/ai/generation-service.ts
- app/api/generate/route.ts
- lib/storage/artwork-repository.ts
- lib/storage/mock-artwork-repository.ts
- lib/creation/session-validation.ts
- components/artwork/artwork-actions.tsx
- components/artwork/artwork-detail.tsx
- app/globals.css

## 重新表达

沿用集中权益中的 regenerateLimit=1。full Session 允许一次，free 不允许。
初始 regenerateUsed=false；旧 Phase 3 数据缺省视为未使用。
RegenerationService 使用现有 generation-client → GenerationService → Mock Provider 链路。
成功结果追加为 creationSession.regeneratedExpression，原 mainArtwork、candidateArtworks、philosophy 及顶层 Artwork 保留。
追加与 regenerateUsed=true 同一次 LocalStorage 写入，失败不会占用次数。存储层重新检查所有权与次数，阻止重复追加。
该服务没有 CreationBalance 或扣额度服务依赖；原图和新版本下载也不调用额度服务。

## 分享卡片

Canvas 本地绘制 1080×1350 PNG。Editorial 使用米白底、上方作品、下方留白与短句；Immersive 使用全幅作品、底部渐暗和左下短句。
日期与集中配置的品牌名位于底部，无二维码、价格或推广。
ShareCardModal 支持样式切换、预览、保存卡片、系统文件分享和复制公开作品链接。
系统分享按浏览器能力检测；不支持时提示保存卡片。私密作品不自动公开，复制链接前提示用户主动公开。
当前 Mock LocalStorage 作品链接仍无法跨设备访问。卡片不包含原始私人文字。

## 验证

- npm test：55/55 通过，包含一次限制、原作品保留、余额不变、刷新、免费拒绝、保存失败恢复与并发拒绝。
- TypeScript 与 ESLint：通过。
- npm run build：通过，13 个页面。
- 浏览器实际完成重新表达并刷新，按钮保持已使用状态。
- 浏览器实际保存 Editorial、Immersive 两种 PNG，文件位于 output/playwright/phase4-editorial.png 与 phase4-immersive.png。
- 原生系统分享面板取决于设备支持；当前验证了文件导出流程，未向外部应用发送内容。
