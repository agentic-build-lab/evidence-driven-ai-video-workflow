# v5_sample_45s_summary

## 交付物

- 成片：`outputs/v5_sample_45s/v5_sample_lipsync.mp4`
- 抽帧总览：`outputs/v5_sample_45s/v5_sample_lipsync_contact_sheet.jpg`
- 资产清单：`outputs/v5_sample_45s/asset_manifest.csv`
- 口型同步状态：`outputs/v5_sample_45s/lip_sync_status.md`

## 本版变化

- 数字人不再使用静态头像或独立旁白，而是使用 HeyGen presenter 视频本身的音轨和口型。
- 官网素材保留“先看整页来源，再变焦到重点，再标注”的结构。
- CNNIC PDF 标注使用行级框选，避免跨行文字用一个大框导致偏差。
- 新华社网页素材重新用 2x 截图，提高放大后的可读性。
- 采集脚本保留 `MANUAL_CAPTURE=1` 模式，遇到真人验证时可以打开可见浏览器让用户手动通过。

## 校验

- Remotion 渲染成功：1590 帧。
- 成片规格：1920x1080，30fps，约 53.03 秒。
- 音轨：AAC 双声道，已确认存在且不是静音。
- 音量：平均约 -20.8 dB，峰值约 -4.2 dB。

## 当前限制

- 这版仍然是短样片，不是完整 3 分钟成片。
- 公共 HeyGen 形象只是流程验证，正式发布前应替换成固定品牌数字人和训练声音。
- PubMed 页面触发了 reCAPTCHA，本版没有纳入；后续可用手动验证模式继续采集。
