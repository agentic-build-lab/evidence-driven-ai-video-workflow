# Privacy Mosaic

隐私处理默认使用柔化马赛克，而不是黑块。

## Modes

- `faces`: 自动人脸检测。
- `regions`: 手动区域打码。
- `both`: 人脸检测和手动区域同时启用。

## Effects

- `mosaic`: 普通马赛克。
- `blur`: 模糊。
- `blur_mosaic`: 推荐的人脸匿名方式。
- `solid`: 极端敏感信息才使用。

## Review

输出后必须抽帧检查：

- 五官是否还能识别。
- 账号名、二维码、手机号、Logo 是否仍可读。
- 马赛克是否遮挡了需要解释的内容。

