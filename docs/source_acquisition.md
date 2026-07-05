# Source Acquisition

来源采集分三类：

| 类型 | 用途 | 默认策略 |
| --- | --- | --- |
| 官方网页 | 证明来源身份、展示上下文 | Playwright 截图 + DOM Range bbox |
| 官方 PDF / 报告 | 提取原文句子和数据 | PDF 渲染图 + `pdfplumber` bbox |
| 公开视频 / B-roll | 补充真实场景 | 只下载必要片段，记录来源并打码 |

## Manual Verification

遇到验证码、真人验证、登录墙时，不自动绕过。使用 `MANUAL_CAPTURE=1` 打开可见浏览器，等待人工完成验证后继续采集。

## Output

采集脚本输出到 `outputs/`，稳定样例和清单整理到 `examples/`。

