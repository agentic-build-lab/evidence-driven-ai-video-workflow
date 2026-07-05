# mainline_v4_sync_summary

## 成片

- 视频：`outputs/mainline_v4_sync/codex_mainline_sync_v4.mp4`
- 规格：1920x1080，30fps，54.67 秒，H.264 + AAC
- 同步事件表：`outputs/mainline_v4_sync/sync_event_timeline.json`
- 同步事件 CSV：`outputs/mainline_v4_sync/sync_event_timeline.csv`
- 自动取框检查图：`outputs/mainline_v4_sync/cnnic_pdf_bbox_debug.png`
- Remotion 检查帧：`outputs/mainline_v4_sync/check_frame_350_bbox_auto.jpg`
- 方法记录：`outputs/video_generation_method_notes.md`

## 本轮完成

- 上一步中断的内容已经补完：v4 成片已重新渲染，并接入了真实 PDF 文本坐标。
- 修复了英文 PDF 标注偏移问题：不再手写大概坐标，而是从 CNNIC PDF 页面里提取目标句子的真实 bbox。
- PDF 标注现在同时输出总框、逐行框、逐行下划线和逐行背景高亮，跨行文字不再强行用一个大框。
- 当前目标句：`short video users amounted to 1,040 million, making up 93.8% of all Internet users.`
- 生成了可复用脚本：`scripts/pdf_bbox/extract_cnnic_pdf_bbox.py`
- 生成了 v4 一键编排脚本：`scripts/workflow/run_mainline_v4_sync_workflow.ps1`
- 生成了 Remotion 可直接读取的数据：`apps/remotion_director/src/cnnic_pdf_bbox_v4.ts`
- 生成的坐标数据：`outputs/mainline_v4_sync/cnnic_pdf_bbox.json`
- 最新坐标：`x=269, y=378, width=1087, height=46`
- 当前目标句只有一行，所以 `lineBoxes` 里只有一个框；跨行目标会自动拆成多个框。

## 验证结果

- `npm.cmd run render:v4` 已成功。
- `powershell -ExecutionPolicy Bypass -File scripts/workflow/run_mainline_v4_sync_workflow.ps1 -SkipRender` 已成功。
- `ffprobe` 确认视频为 1920x1080、30fps、54.67 秒。
- `check_frame_350_bbox_auto.jpg` 已人工检查，红框已经对齐英文目标句。
- `check_frame_350_workflow.jpg` 已人工检查，一键流程重新生成后红框仍然对齐目标句。
- `cnnic_pdf_bbox_debug.png` 保留为取框诊断图，方便以后判断是否识别到了正确文字。
- `video_generation_method_notes.md` 已记录跨行标注、音画同步、引用视频、隐私打码和后续 skill 化建议。

## 重要记录

- 尝试安装 PyMuPDF 时网络中断，所以这次改用 Codex bundled Python 里已有的 `pdfplumber` 完成 PDF 文本坐标提取。
- 本机 `npx remotion still` 曾触发 Node fatal error；一键脚本已改为 `npm exec -- remotion still ...`，验证可稳定生成检查帧。
- 中文网页标注继续优先使用 Playwright DOM `Range.getClientRects()`，因为中文页面用 DOM 坐标最稳定。
- PDF 或图片型来源应走 OCR/PDF bbox 流程，避免继续靠手写坐标猜位置。
- 后续一键流程应把“网页 DOM 坐标”和“PDF bbox 坐标”统一成同一种 overlay 数据结构。

## 下一步建议

- 把 `extract_cnnic_pdf_bbox.py` 接进主工作流脚本，形成“下载/截图/取框/生成事件/渲染”的完整链路。
- 对 3 分钟版本先生成完整 `sync_event_timeline`，再让 Remotion 按事件驱动镜头、标红、下划线和引用视频切换。
- 为每个引用素材生成 manifest，记录来源、用途、是否需要打码、是否可公开发布。
