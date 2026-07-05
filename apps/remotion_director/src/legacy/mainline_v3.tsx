import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const fps = 30;
const s = (seconds: number) => Math.round(seconds * fps);

const colors = {
  paper: '#f3ead6',
  ink: '#171512',
  red: '#c62828',
  blue: '#2458a6',
  green: '#2d7658',
  yellow: '#f0c84b',
  muted: '#665f52',
  white: '#fffdf5',
  wash: '#e8dec8',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
  fontWeight: 900,
  letterSpacing: 0,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
  letterSpacing: 0,
};

const hardBorder: React.CSSProperties = {
  border: `5px solid ${colors.ink}`,
  borderRadius: 8,
  boxShadow: '9px 9px 0 rgba(23,21,18,0.16)',
};

const cameraEase = Easing.bezier(0.18, 0, 0.04, 1);
const move = (
  frame: number,
  input: [number, number] | [number, number, number],
  output: [number, number] | [number, number, number],
) =>
  interpolate(frame, input, output, {
    easing: cameraEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Label: React.FC<{children: React.ReactNode; x: number; y: number; tone?: 'red' | 'blue' | 'green'}> = ({
  children,
  x,
  y,
  tone = 'red',
}) => (
  <div
    style={{
      ...titleStyle,
      position: 'absolute',
      left: x,
      top: y,
      zIndex: 20,
      background: colors[tone],
      color: '#fff',
      padding: '8px 13px',
      fontSize: 24,
      lineHeight: 1,
    }}
  >
    {children}
  </div>
);

const SectionTitle: React.FC<{children: React.ReactNode; y?: number; size?: number}> = ({
  children,
  y = 72,
  size = 58,
}) => (
  <div
    style={{
      ...titleStyle,
      position: 'absolute',
      left: 86,
      top: y,
      width: 1510,
      fontSize: size,
      lineHeight: 1.08,
      color: colors.ink,
      zIndex: 12,
    }}
  >
    {children}
  </div>
);

const BrowserFrame: React.FC<{
  label: string;
  url: string;
  left: number;
  top: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({label, url, left, top, width, height, children}) => (
  <div
    style={{
      ...hardBorder,
      position: 'absolute',
      left,
      top,
      width,
      height,
      background: '#fff',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 58,
        background: '#eceff2',
        borderBottom: `4px solid ${colors.ink}`,
        zIndex: 10,
      }}
    >
      <div style={{position: 'absolute', left: 18, top: 20, display: 'flex', gap: 8}}>
        {['#df4b42', '#efbd3b', '#48a85c'].map((dot) => (
          <div key={dot} style={{width: 13, height: 13, borderRadius: 7, background: dot, border: '2px solid #111'}} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 94,
          top: 11,
          right: 18,
          height: 34,
          borderRadius: 17,
          border: '3px solid #bcc3cd',
          background: '#fff',
          color: colors.muted,
          fontSize: 18,
          lineHeight: '29px',
          paddingLeft: 15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {url}
      </div>
    </div>
    <Label x={18} y={76}>
      {label}
    </Label>
    <div style={{position: 'absolute', left: 0, right: 0, top: 58, bottom: 0, overflow: 'hidden'}}>{children}</div>
  </div>
);

type SourcePlan = {
  image: string;
  label: string;
  url: string;
  marker: {x: number; y: number; width: number; height: number};
  zoom: {scale: number; x: number; y: number};
};

const SourceZoom: React.FC<SourcePlan & {left: number; top: number; width: number; height: number}> = ({
  image,
  label,
  url,
  marker,
  zoom,
  left,
  top,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const scale = move(frame, [0, 70, 136], [0.74, 0.74, zoom.scale]);
  const tx = move(frame, [0, 70, 136], [0, 0, zoom.x]);
  const ty = move(frame, [0, 70, 136], [0, 0, zoom.y]);
  const markerWidth = interpolate(frame, [150, 170], [0, marker.width], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <BrowserFrame label={label} url={url} left={left} top={top} width={width} height={height}>
      <div
        style={{
          position: 'absolute',
          left: tx,
          top: ty,
          width: 1440,
          height: 900,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img src={staticFile(image)} style={{position: 'absolute', left: 0, top: 0, width: 1440, height: 900}} />
        <div
          style={{
            position: 'absolute',
            left: marker.x,
            top: marker.y,
            width: markerWidth,
            height: marker.height,
            border: `4px solid ${colors.red}`,
            background: 'rgba(198,40,40,0.08)',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: marker.x,
            top: marker.y + marker.height + 10,
            width: markerWidth,
            height: 8,
            background: 'rgba(198,40,40,0.72)',
          }}
        />
      </div>
    </BrowserFrame>
  );
};

const AvatarBadge: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 82,
      bottom: 62,
      width: 178,
      height: 178,
      borderRadius: 90,
      overflow: 'hidden',
      border: `5px solid ${colors.ink}`,
      background: '#fff',
      boxShadow: '7px 7px 0 rgba(23,21,18,0.15)',
      zIndex: 35,
    }}
  >
    <img src={staticFile('presenter.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 16%'}} />
  </div>
);

const OfficialSourceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = move(frame, [176, 205], [40, 0]);
  return (
    <>
      <SectionTitle>先别念结论，先把来源摆出来</SectionTitle>
      <SourceZoom
        image="chinese_douyin_publish_solution.png"
        label="抖音开放平台文档"
        url="open.douyin.com / content-management / douyin-publish-solution"
        left={82}
        top={184}
        width={1160}
        height={702}
        marker={{x: 400, y: 198, width: 588, height: 22}}
        zoom={{scale: 1.15, x: -238, y: 40}}
      />
      <BrowserFrame
        label="CNNIC 官方报告"
        url="cnnic.com.cn / 第55次统计报告"
        left={1292}
        top={184}
        width={520}
        height={382}
      >
        <img
          src={staticFile('official_cnnic_page_40.png')}
          style={{position: 'absolute', left: 92, top: -12, width: 310}}
        />
      </BrowserFrame>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 1292,
          top: 596 + captionIn,
          width: 520,
          height: 184,
          background: colors.white,
          opacity: move(frame, [176, 205], [0, 1]),
          padding: '28px 30px',
          boxSizing: 'border-box',
          fontSize: 30,
          lineHeight: 1.28,
          color: colors.ink,
        }}
      >
        这一段只做两个动作：确认官网，再锁定关键句。推近之后镜头不再抖。
      </div>
    </>
  );
};

const PlatformPanel: React.FC<{
  src: string;
  label: string;
  x: number;
  y: number;
  activeStart: number;
  activeEnd: number;
}> = ({src, label, x, y, activeStart, activeEnd}) => {
  const frame = useCurrentFrame();
  const active = frame >= activeStart && frame < activeEnd;
  const scale = active ? move(frame, [activeStart, activeStart + 70], [0.58, 0.72]) : 0.58;
  const opacity = move(frame, [x < 900 ? 10 : 44, x < 900 ? 36 : 70], [0, 1]);
  return (
    <div
      style={{
        ...hardBorder,
        position: 'absolute',
        left: x,
        top: y,
        width: 760,
        height: 420,
        background: '#fff',
        overflow: 'hidden',
        opacity,
      }}
    >
      <img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          left: active ? -92 : 0,
          top: active ? -42 : 0,
          width: 1320,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          filter: active ? 'contrast(1.04)' : 'saturate(0.72) contrast(0.92)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 24,
          background: active ? colors.red : colors.ink,
          color: '#fff',
          fontSize: 26,
          fontWeight: 900,
          padding: '9px 13px',
        }}
      >
        {label}
      </div>
    </div>
  );
};

const PlatformScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <SectionTitle>工具已经进入可用区间，难点转到稳定可控</SectionTitle>
      <PlatformPanel src="platform_google_deepmind_veo.png" label="Veo / 模型能力" x={90} y={184} activeStart={52} activeEnd={178} />
      <PlatformPanel src="platform_runway_gen4.png" label="Runway / 连贯性" x={1010} y={184} activeStart={178} activeEnd={315} />
      <BrowserFrame label="剪映官网" url="capcut.cn / AI 创作" left={90} top={642} width={836} height={300}>
        <img src={staticFile('chinese_capcut_cn.png')} style={{position: 'absolute', left: 0, top: -128, width: 836}} />
      </BrowserFrame>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 1008,
          top: 652,
          width: 650,
          height: 214,
          background: colors.white,
          padding: '24px 30px',
          boxSizing: 'border-box',
          fontSize: 31,
          lineHeight: 1.28,
          color: colors.ink,
          opacity: move(frame, [210, 244], [0, 1]),
        }}
      >
        这里不能吹“全自动完美”。真正要讲的是：把不稳定的生成能力装进稳定的流程。
      </div>
    </>
  );
};

const FlowNode: React.FC<{text: string; index: number}> = ({text, index}) => {
  const frame = useCurrentFrame();
  const visible = move(frame, [28 + index * 24, 52 + index * 24], [0, 1]);
  const active = frame > 72 + index * 34;
  return (
    <div
      style={{
        position: 'absolute',
        left: 92 + index * 218,
        top: 690,
        width: 156,
        height: 72,
        borderRadius: 38,
        border: `5px solid ${colors.ink}`,
        background: active ? colors.red : colors.white,
        color: active ? '#fff' : colors.ink,
        opacity: visible,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        fontWeight: 900,
      }}
    >
      {text}
    </div>
  );
};

const CitedClip: React.FC<{src: string; label: string}> = ({src, label}) => (
  <div
    style={{
      ...hardBorder,
      position: 'absolute',
      left: 1184,
      top: 206,
      width: 358,
      height: 636,
      borderRadius: 18,
      background: '#fff',
      overflow: 'hidden',
    }}
  >
    <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 18,
        background: 'rgba(23,21,18,0.86)',
        color: '#fff',
        padding: '12px 14px',
        fontSize: 23,
        lineHeight: 1.18,
        fontWeight: 900,
      }}
    >
      {label}
    </div>
  </div>
);

const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const secondClip = frame > 232;
  const steps = ['调研', '脚本', '声音', '数字人', '素材', '包装', '质检'];
  return (
    <>
      <SectionTitle>我们做的不是一个按钮，而是一条生产链</SectionTitle>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 92,
          top: 202,
          width: 980,
          height: 394,
          background: colors.white,
          padding: '38px 46px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{...titleStyle, fontSize: 46, color: colors.red, marginBottom: 22}}>导演系统</div>
        <div style={{fontSize: 34, lineHeight: 1.34, color: colors.ink}}>
          每一步都要能检查、替换、回滚。素材来自哪里、画面怎么动、声音用哪一版，都不能靠临时手调。
        </div>
        <div style={{position: 'absolute', left: 46, bottom: 38, fontSize: 27, color: colors.muted}}>
          外部引用视频已走柔化马赛克处理，只做内部效果验证。
        </div>
      </div>
      {steps.map((step, index) => (
        <FlowNode key={step} text={step} index={index} />
      ))}
      {secondClip ? (
        <CitedClip src="douyin_jianying_digital_avatar_strong_face_mosaic.mp4" label="引用样本 / 柔化人脸马赛克" />
      ) : (
        <CitedClip src="douyin_ai_avatar_traffic_question_strong_face_mosaic.mp4" label="引用样本 / 已匿名处理" />
      )}
      <div
        style={{
          position: 'absolute',
          left: 1570,
          top: 330,
          width: 210,
          height: 160,
          color: colors.ink,
          fontSize: 28,
          lineHeight: 1.24,
          fontWeight: 900,
        }}
      >
        视频引用可以成为证据窗口，但必须先过隐私和授权检查。
      </div>
    </>
  );
};

const SystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const checks = ['官网截图入库', '坐标级标注', '公开视频采样', '柔化马赛克', '训练声线', '人工审核'];
  const scale = move(frame, [0, 86, 184], [0.82, 0.82, 1.14]);
  const tx = move(frame, [0, 86, 184], [0, 0, -148]);
  const ty = move(frame, [0, 86, 184], [0, 0, -56]);
  return (
    <>
      <SectionTitle>现在已经跑通的是这几块</SectionTitle>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 92,
          top: 200,
          width: 1060,
          height: 548,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <img
          src={staticFile('studio_assets.png')}
          style={{
            width: 1180,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 32,
            bottom: 28,
            background: colors.red,
            color: '#fff',
            padding: '12px 16px',
            fontSize: 26,
            fontWeight: 900,
          }}
        >
          重点：流程可复用
        </div>
      </div>
      <div style={{position: 'absolute', left: 1234, top: 214, width: 570}}>
        {checks.map((item, index) => (
          <div
            key={item}
            style={{
              height: 74,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: move(frame, [24 + index * 18, 42 + index * 18], [0, 1]),
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                border: `4px solid ${colors.ink}`,
                background: colors.green,
                color: '#fff',
                fontSize: 27,
                fontWeight: 900,
                textAlign: 'center',
                lineHeight: '34px',
              }}
            >
              ✓
            </div>
            <div style={{fontSize: 34, fontWeight: 900, color: colors.ink}}>{item}</div>
          </div>
        ))}
      </div>
      <AvatarBadge />
    </>
  );
};

const IssuesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const issues = ['素材授权', '动作真实感', '长视频节奏', '口型一致性', '发布前审核'];
  return (
    <>
      <SectionTitle>方向能成立，但还不能直接发布</SectionTitle>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 92,
          top: 198,
          width: 780,
          height: 556,
          background: colors.white,
          padding: '38px 44px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{...titleStyle, fontSize: 42, color: colors.red, marginBottom: 24}}>下一轮打磨点</div>
        {issues.map((issue, index) => (
          <div
            key={issue}
            style={{
              height: 70,
              fontSize: 33,
              color: colors.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: move(frame, [22 + index * 20, 42 + index * 20], [0, 1]),
            }}
          >
            <span style={{color: colors.red, fontWeight: 900}}>0{index + 1}</span>
            <span>{issue}</span>
          </div>
        ))}
      </div>
      <BrowserFrame label="验证页处理" url="openai.com / index / sora" left={968} top={198} width={730} height={354}>
        <img src={staticFile('platform_openai_sora_probe.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </BrowserFrame>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 968,
          top: 596,
          width: 730,
          height: 192,
          background: colors.white,
          padding: '28px 34px',
          boxSizing: 'border-box',
          fontSize: 30,
          lineHeight: 1.3,
          color: colors.ink,
          opacity: move(frame, [130, 154], [0, 1]),
        }}
      >
        反爬和验证码不绕过。要么人工验证后截图，要么换官方摘要、API、授权素材或可公开下载来源。
      </div>
      <AvatarBadge />
    </>
  );
};

export const CodexMainlineV3: React.FC = () => {
  const frame = useCurrentFrame();
  const bgShift = interpolate(frame, [0, s(54.54)], [0, -72], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: colors.paper, overflow: 'hidden', ...bodyStyle}}>
      <Audio src={staticFile('style_probe_v2_energetic.wav')} volume={0.98} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(23,21,18,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(198,40,40,0.07), transparent 44%)',
          backgroundSize: '28px 28px, 100% 100%',
          transform: `translateY(${bgShift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          border: '22px solid #111',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 60,
        }}
      />
      <div style={{position: 'absolute', left: 82, top: 42, fontSize: 26, color: colors.muted, fontWeight: 800, zIndex: 50}}>
        MAINLINE V3 / 旁白驱动镜头 / 内部样片
      </div>
      <div style={{...titleStyle, position: 'absolute', right: 82, top: 38, fontSize: 32, color: colors.red, zIndex: 50}}>
        CODEX VIDEO LAB
      </div>

      <Sequence from={s(0)} durationInFrames={s(11.95)}>
        <OfficialSourceScene />
      </Sequence>
      <Sequence from={s(11.95)} durationInFrames={s(12)}>
        <PlatformScene />
      </Sequence>
      <Sequence from={s(23.95)} durationInFrames={s(15.7)}>
        <WorkflowScene />
      </Sequence>
      <Sequence from={s(39.65)} durationInFrames={s(7.1)}>
        <SystemScene />
      </Sequence>
      <Sequence from={s(46.75)} durationInFrames={s(7.8)}>
        <IssuesScene />
      </Sequence>
    </AbsoluteFill>
  );
};
