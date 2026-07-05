# Architecture

本项目按“证据采集、证据定位、同步导演、合成渲染、质量检查”拆分。

## Pipeline

1. `source_capture`: 采集官方网页、报告页、PDF 渲染图、页面标题、URL 和截图。
2. `bbox_extraction`: 对网页使用 DOM Range，对 PDF 使用 `pdfplumber`，输出逐行 bbox。
3. `sync_timeline`: 把旁白拆成句级 cue，每个 cue 绑定素材、目标文字和动画动作。
4. `privacy_mosaic`: 对引用视频、评论、人脸、账号和二维码做打码。
5. `remotion_director`: 按事件表合成截图、标注、引用视频、字幕、数字人和转场。
6. `quality_gate`: 输出抽帧、素材清单、来源清单和人工复核记录。

## Design Rules

- 证据镜头先展示来源身份，再推近重点句。
- 旁白说到哪里，画面动作才到哪里。
- 跨行文字使用逐行框、下划线或背景，不用一个大框覆盖整段。
- 引用视频必须先记录来源、用途、授权状态和隐私处理状态。
- 发布前保留人工 review gate，不默认全自动发布。

