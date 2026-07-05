[CmdletBinding()]
param(
    [string]$OutputPath = "work/v5_sample/assets/v5_sample_45s_voiceover.wav",
    [string]$VoiceName = "Microsoft Huihui Desktop",
    [int]$Rate = 2,
    [int]$Volume = 100
)

$ErrorActionPreference = "Stop"

$Text = @'
你有没有这种时候：已经很累了，明明只是想刷两分钟，结果一抬头，半个小时过去了。
这件事最好别先怪自己，因为今天的短视频，早就不只是一个娱乐应用了。
CNNIC 的报告里，短视频用户规模已经到十点四零亿，占网民整体百分之九十三点八。
新华社报道的二零二六网络视听报告里，网络视听用户规模已经到十点九九亿。
换句话说，它已经像空气一样进入了日常生活。
'@

$ResolvedOutput = Join-Path (Resolve-Path ".") $OutputPath
$OutputDirectory = Split-Path -Parent $ResolvedOutput
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

Add-Type -AssemblyName System.Speech
$Synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$Synth.SelectVoice($VoiceName)
$Synth.Rate = $Rate
$Synth.Volume = $Volume
$Synth.SetOutputToWaveFile($ResolvedOutput)
$Synth.Speak($Text)
$Synth.SetOutputToNull()
$Synth.Dispose()

[ordered]@{
    output = $ResolvedOutput
    voice = $VoiceName
    rate = $Rate
    volume = $Volume
    textLength = $Text.Length
} | ConvertTo-Json
