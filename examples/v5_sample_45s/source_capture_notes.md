# v5_source_capture_notes

## 已完成

- 新华社页面可以自动抓取，没有反爬。
- `xinhua_av_2026` 已生成顶部图、聚焦图、标注图和 DOM 坐标。
- 标注策略已改为“只选一个主标注”，避免整页多个相同数字都被标红。
- 新华社主页面已改用 2x `deviceScaleFactor` 重新抓取，放入 1080p 视频后更清晰。
- CNNIC 报告页沿用 v4 已验证的 PDF bbox 流程。

## 人机验证处理

`capture_v5_source_pages.mjs` 已支持手动验证模式。

自动模式：

```powershell
node scripts/source_capture/capture_v5_source_pages.mjs
```

手动验证模式：

```powershell
$env:MANUAL_CAPTURE='1'
$env:TARGET_ID='pubmed_notification'
$env:MANUAL_WAIT_MS='180000'
node scripts/source_capture/capture_v5_source_pages.mjs
```

出现验证页时，脚本会打开可见浏览器，等待人工完成验证，然后继续截图和取坐标。

## 当前限制

- PubMed 当前触发 reCAPTCHA，不进入 45 秒样片；三分钟版需要论文画面时再让用户手动验证。
- 新华社 AI 生态页面的目标词目前只做候选，不进入 45 秒样片。
- `edge-tts` 生成的旁白只是占位声音，最终应替换成训练声音或 HeyGen 完整口型视频的音轨。
