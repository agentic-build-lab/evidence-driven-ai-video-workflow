# Sync Timeline

同步事件表是本项目的导演层。

每条 cue 至少包含：

- `id`
- `startSec`
- `endSec`
- `narration`
- `visualTarget`
- `action`
- `sourceId`
- `targetText`
- `highlightStyle`

## Rule

旁白是画面动作的触发器：

- 说“来源”：显示完整来源。
- 说“推近”：镜头变焦。
- 说具体数字：显示对应原文高亮。
- 说“风险”：显示限制或审核卡片。
- 说“下一步”：显示 checklist 或 roadmap。

