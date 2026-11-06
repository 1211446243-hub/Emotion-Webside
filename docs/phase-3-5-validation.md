# Phase 3–5 验证记录

## 范围

沿用原目录和首页版式，只为首页提交增加 Mock 登录检查；没有添加 `/create` 生成流程、图片 Provider 实现、GenerationService 或 Repository 实现。

## 验证方式

- `npm test`：20 项通过，包括下表 10 个案例、所有 15 个主题的可达性、混合情绪、强度边界、Unicode 长度、6 种风格、4 种人物表现及无人构图、工厂和 Auth Provider。
- `npm run inspect:text`：打印每个案例的完整 Analysis、Quote 与 ImageGenerationPrompt，已逐条检查字段完整性、主题、场景和人像限制。
- Phase 3 构建通过；Phase 4 `tsc --noEmit` 通过。
- 最终 `npm run lint`、`npm test`（20/20）、`npm run build` 全部通过，构建路由仅包含首页、登录、注册、图标和框架默认 404。
- 浏览器验证：未登录提交 → 登录 → 返回首页、输入保留；刷新恢复登录；注册密码不一致时报错；注册成功显示昵称；退出清除状态；外部 returnTo 返回首页。
- 375px 登录/注册页无横向溢出；1440px 登录页已检查。手机菜单点击登录后关闭；跨标签页登录/退出同步；登录页页脚可返回首页输入区。
- 截图初次在 hydration 前隐藏输入光标，触发工具注入样式的 React 警告；改为加载完成后保留光标截图，复核无控制台错误或 hydration 错误。
- 密码和邮箱未写入 localStorage；存储失败在单元测试中覆盖。
- 原始文字只在 Context 内存保留，刷新后清空是当前有意设计的边界。

## 人工检查的 10 个案例

| 输入方向 | 主情绪 | 哲学主题 | 视觉结果 |
| --- | --- | --- | --- |
| 平静但不想未来一眼看到头 | calm，辅以 uncertainty / freedom / desire | freedom / meaning / uncertainty | 开阔旷野、远方小路与雾 |
| 想起童年住处和下午阳光 | nostalgia | memory / time | 旧房间、褪色窗框、长影 |
| 不知以后走哪条路 | uncertainty | choice / uncertainty / existence | 荒野岔路与不同消失点 |
| 没有特别的事，安静也很好 | peace | existence | 广阔静谧空间与小尺度背影 |
| 人很小，最后留下什么 | calm | existence / meaning / mortality | 天空、微小痕迹、落叶与石头 |
| 一个人在空房间 | loneliness | loneliness | 巨大走廊、空椅子、冷色弱光 |
| 渴望自由，不想受控制 | freedom，辅以 desire | freedom / desire | 无边地平线与远处对象 |
| 杯子放在桌上（无关键词） | calm | existence / meaning | 默认广阔空间与微小背影 |
| 开心快乐，同时担心焦虑 | joy，辅以 anxiety | existence / meaning | 开放与紧张同时保留在氛围字段 |
| 期待与朋友相遇 | hope | connection / hope | 两岸、桥、共用水面与远方微光 |

每项结果均包含中文原创短句；提示词默认 4:5、后印象派、油画厚涂，明确人物不超过画面约 5%，禁止可见清晰正脸。无人物分支包含 no people 及对应负向约束。

这是关键词模拟，不理解否定、语境或真实心理状态；没有关键词时的默认结果是设计约定，不是对用户的判断。供应商占位方法明确报错，不会真的请求 API。
