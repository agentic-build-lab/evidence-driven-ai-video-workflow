# lip_sync_status

## 当前状态

- 最终样片已经改为使用 HeyGen 数字人视频自带音轨，不再叠加独立 TTS 音频。
- 这样可以保证角落数字人的嘴型和声音来自同一个素材，避免“嘴动一套、声音一套”的不同步问题。
- 最终数字人素材：`work/v5_sample/assets/heygen_v5_sample_lipsync_presenter.webm`
- Remotion public 素材：`apps/remotion_director/public/local_assets/v5_sample/heygen_v5_sample_45s_presenter.webm`
- 最终合成视频：`outputs/v5_sample_45s/v5_sample_lipsync.mp4`

## 校验结果

- 成片：1920x1080，30fps，约 53.03 秒。
- 音轨：AAC 双声道，已确认不是静音。
- 音量：平均约 -20.8 dB，峰值约 -4.2 dB。
- HeyGen 原始 presenter：约 52.68 秒，包含 VP9 视频流和 Opus 音频流。

## 保留素材

- `work/v5_sample/assets/heygen_lip_sync_smoke_test.webm` 是 7.09 秒口型烟测素材，用于证明透明数字人可以进入 Remotion 小窗。
- `work/v5_sample/assets/v5_sample_45s_voiceover.mp3` 是 edge-tts 占位音频，只保留为节奏参考，不作为最终样片主音轨。

## 后续建议

- 当前公共数字人适合证明流程，但不适合作为长期账号固定形象。
- 正式版本建议替换成我们自己的训练声音、固定头像和稳定包装。
- 如果继续做 3 分钟完整版，需要先把脚本切成句级 cue，再驱动画面缩放、标红、下划线和视频引用节奏。
