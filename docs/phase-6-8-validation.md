# Phase 6–8 验证

- 本地素材：6 张原创 SVG 占位构图，800×1000、4:5，无外链或脚本；自动验证资源存在。
- 单元测试扩展至 29 项：图片匹配、无人物限制、完整私密 Artwork、唯一 ID、阶段顺序、取消、输入校验、每阶段强制失败、Provider 失败后重试、本地路由校验、流式 UTF-8 分块与断流。
- 浏览器实际链路：未登录填写 → 登录 → 自动进入生成 → 三个阶段 → 图片与短句。完整链路只发出一次生成请求，无外部资源请求、无控制台错误。
- 375px 完成页面宽度为 375px，无横向溢出；1440px 页面及绘制阶段已截图检查。
- 已修复 Next 开发服务器将请求 URL 规范化成 localhost 导致 127.0.0.1 访问误报跨源的问题，并添加回归测试。
- 刷新生成页后显示空状态，符合本阶段仅内存展示的边界。
- 浏览器注入一次生成错误后重试成功；中途取消后原文保留，等待超过原任务时长也没有过期结果回写。
- 本地图片请求失败会显示友好错误；恢复图片请求后重试成功，确认图片 naturalWidth 为 800。
- reduced motion 实测：transition 为 0s、filter 与 transform 为 none，完成图片 animation 为 none。
- 最终 `npm test` 29/29、`npm run lint`、`npm run build` 全部通过。刻意注入故障时的开发日志是预期错误；正常生成链路无控制台错误。

检查命令：`npm test`、`npm run lint`、`npm run build`。

截图位于 `output/playwright/generation-painting-1440.png`、`generation-complete-1440.png`、`generation-complete-375.png`。

作品尚未持久化，模拟身份也不是服务端真实认证；这些实现分别留在后续阶段。
