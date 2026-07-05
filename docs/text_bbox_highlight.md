# Text Bbox Highlight

## Webpage DOM Bbox

中文网页优先使用 DOM Range：

1. Playwright 打开页面。
2. 找到目标文本节点。
3. 对目标文本创建 `Range`。
4. 使用 `Range.getClientRects()` 获取逐行矩形。
5. 输出 `rects`、页面标题、URL、viewport 和是否触发验证。

## PDF Bbox

PDF 使用 `pdfplumber`：

1. 提取页面 words。
2. 对目标句 token 序列做匹配。
3. 计算总 bbox。
4. 按行分组，输出 `lineBoxes`。
5. 按渲染图片尺寸缩放到像素坐标。
6. 同时输出 debug image，方便人工检查。

## Overlay Schema

统一字段建议：

```json
{
  "source_id": "cnnic_report_page_40",
  "target_text": "short video users amounted...",
  "page": 40,
  "line_boxes": [
    {"x": 269, "y": 378, "width": 1087, "height": 46}
  ],
  "style": "line_box",
  "fallback_styles": ["underline", "background"]
}
```

