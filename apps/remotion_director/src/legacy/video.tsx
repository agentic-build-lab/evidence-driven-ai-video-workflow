import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const colors = {
  paper: '#f5edd8',
  ink: '#171512',
  red: '#c62828',
  blue: '#2556a3',
  green: '#2e7d57',
  yellow: '#f2c94c',
  muted: '#6b665a',
  white: '#fffdf5',
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

const handBorder: React.CSSProperties = {
  border: `5px solid ${colors.ink}`,
  borderRadius: 10,
  boxShadow: '10px 10px 0 rgba(23, 21, 18, 0.16)',
};

const cameraEase = Easing.bezier(0.18, 0.0, 0.04, 1.0);

const clampInterpolate = (
  frame: number,
  input: [number, number] | [number, number, number],
  output: [number, number] | [number, number, number],
) =>
  interpolate(frame, input, output, {
    easing: cameraEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const PaperTitle: React.FC<{children: React.ReactNode; top?: number; size?: number}> = ({
  children,
  top = 100,
  size = 64,
}) => (
  <div
    style={{
      ...titleStyle,
      position: 'absolute',
      left: 108,
      top,
      fontSize: size,
      lineHeight: 1.12,
      color: colors.ink,
      maxWidth: 1500,
    }}
  >
    {children}
  </div>
);

const Marker: React.FC<{x: number; y: number; width: number; height?: number; delay: number; color?: string}> = ({
  x,
  y,
  width,
  height = 18,
  delay,
  color = 'rgba(242, 201, 76, 0.72)',
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [delay, delay + 18], [0, width], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: grow,
        height,
        background: color,
        transform: 'rotate(-0.7deg)',
      }}
    />
  );
};

const BrowserShell: React.FC<{
  label: string;
  url: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({label, url, style, children}) => (
  <div
    style={{
      position: 'absolute',
      background: '#ffffff',
      overflow: 'hidden',
      ...handBorder,
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 56,
        background: '#edf0f3',
        borderBottom: `4px solid ${colors.ink}`,
        zIndex: 5,
      }}
    >
      <div style={{position: 'absolute', left: 20, top: 19, display: 'flex', gap: 8}}>
        {['#df4b42', '#efbd3b', '#48a85c'].map((dot) => (
          <div key={dot} style={{width: 13, height: 13, borderRadius: 7, background: dot, border: '2px solid #111'}} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 10,
          right: 20,
          height: 34,
          borderRadius: 17,
          background: '#fff',
          border: '3px solid #bcc3cd',
          color: colors.muted,
          fontSize: 18,
          lineHeight: '29px',
          paddingLeft: 16,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {url}
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 18,
        top: 70,
        background: colors.red,
        color: '#fff',
        padding: '8px 13px',
        fontSize: 22,
        fontWeight: 900,
        zIndex: 6,
      }}
    >
      {label}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, overflow: 'hidden'}}>{children}</div>
  </div>
);

const AvatarBadge: React.FC<{corner?: 'right' | 'left'}> = ({corner = 'right'}) => (
  <div
    style={{
      position: 'absolute',
      right: corner === 'right' ? 86 : undefined,
      left: corner === 'left' ? 86 : undefined,
      bottom: 62,
      width: 210,
      height: 210,
      borderRadius: 105,
      overflow: 'hidden',
      border: `6px solid ${colors.ink}`,
      background: '#fff',
      boxShadow: '8px 8px 0 rgba(23,21,18,0.16)',
      zIndex: 20,
    }}
  >
    <img
      src={staticFile('presenter.png')}
      style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 16%'}}
    />
  </div>
);

const IntroSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame, fps, config: {damping: 19, stiffness: 92}});
  const underline = interpolate(frame, [44, 68], [0, 580], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <>
      <PaperTitle top={236} size={78}>
        一键口播视频，
        <br />
        不该只是动态 PPT
      </PaperTitle>
      <div
        style={{
          ...bodyStyle,
          position: 'absolute',
          left: 116,
          top: 466,
          width: 1010,
          fontSize: 42,
          lineHeight: 1.36,
          color: colors.ink,
          opacity: intro,
          transform: `translateY(${(1 - intro) * 28}px)`,
        }}
      >
        这版先验证一种更像短视频的做法：先摆出来源，再推近证据，最后让画面跟着论证走。
      </div>
      <div
        style={{
          position: 'absolute',
          left: 116,
          top: 607,
          width: underline,
          height: 14,
          background: colors.yellow,
          transform: 'rotate(-1deg)',
        }}
      />
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          right: 140,
          top: 244,
          width: 430,
          height: 512,
          background: colors.white,
          transform: `rotate(${interpolate(frame, [0, 45], [-5, -1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}deg)`,
        }}
      >
        <div style={{...titleStyle, position: 'absolute', left: 38, top: 44, fontSize: 44, color: colors.red}}>内部样片</div>
        <div style={{position: 'absolute', left: 42, top: 132, width: 342, fontSize: 32, lineHeight: 1.32, color: colors.ink}}>
          风格参考：白板推演 + 证据截图 + 快节奏剪辑
        </div>
        <div style={{position: 'absolute', left: 42, bottom: 48, fontSize: 24, color: colors.muted}}>
          不复制包装，不直接发布
        </div>
      </div>
    </>
  );
};

const OfficialSourceSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const pdfScale = clampInterpolate(frame, [0, 105, 180, 300], [0.78, 0.78, 1.58, 1.62]);
  const pdfX = clampInterpolate(frame, [0, 105, 180, 300], [352, 352, 92, 72]);
  const pdfY = clampInterpolate(frame, [0, 105, 180, 300], [8, 8, -98, -118]);
  const xinhuaY = clampInterpolate(frame, [20, 145, 260], [0, -440, -860]);
  const redFade = interpolate(frame, [176, 194], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <>
      <PaperTitle top={86} size={60}>第一步：不要只念数据，要让观众看见官网</PaperTitle>
      <BrowserShell
        label="CNNIC 官方报告 PDF"
        url="cnnic.com.cn / IDR / 第55次《中国互联网络发展状况统计报告》"
        style={{left: 96, top: 218, width: 1234, height: 692}}
      >
        <img
          src={staticFile('official_cnnic_page_40.png')}
          style={{
            position: 'absolute',
            left: pdfX,
            top: pdfY,
            width: 545,
            transform: `scale(${pdfScale})`,
            transformOrigin: 'top left',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 238,
            top: 72,
            width: 548,
            height: 31,
            border: `3px solid rgba(198, 40, 40, 0.88)`,
            background: 'rgba(198, 40, 40, 0.05)',
            opacity: redFade,
            boxSizing: 'border-box',
          }}
        />
        <Marker x={264} y={113} width={432} height={7} delay={208} color="rgba(198,40,40,0.65)" />
      </BrowserShell>

      <BrowserShell
        label="新华网原文"
        url="news.cn / 网络视听发展研究报告"
        style={{right: 86, top: 218, width: 440, height: 692}}
      >
        <img
          src={staticFile('official_xinhua_network_av_2026_full.png')}
          style={{position: 'absolute', left: -155, top: xinhuaY, width: 720}}
        />
      </BrowserShell>

      <div
        style={{
          ...titleStyle,
          position: 'absolute',
          left: 112,
          bottom: 50,
          width: 1300,
          fontSize: 31,
          lineHeight: 1.2,
          color: colors.ink,
        }}
      >
        画面动作只做一件事：从“这是哪个官网”推到“哪一句话最关键”。
      </div>
    </>
  );
};

const PlatformCard: React.FC<{
  src: string;
  label: string;
  url: string;
  left: number;
  top: number;
  delay: number;
  zoomX: number;
  zoomY: number;
}> = ({src, label, url, left, top, delay, zoomX, zoomY}) => {
  const frame = useCurrentFrame();
  const enter = clampInterpolate(frame, [delay, delay + 28], [70, 0]);
  const scale = clampInterpolate(frame, [delay + 66, delay + 150], [0.57, 0.78]);
  const x = clampInterpolate(frame, [delay + 66, delay + 150], [0, zoomX]);
  const y = clampInterpolate(frame, [delay + 66, delay + 150], [0, zoomY]);

  return (
    <BrowserShell
      label={label}
      url={url}
      style={{left, top: top + enter, width: 790, height: 512, opacity: clampInterpolate(frame, [delay, delay + 22], [0, 1])}}
    >
      <img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 1440,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </BrowserShell>
  );
};

const PlatformSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const noteIn = clampInterpolate(frame, [230, 260], [50, 0]);

  return (
    <>
      <PaperTitle top={82} size={60}>第二步：把“可用阶段”和“可控问题”分开讲</PaperTitle>
      <PlatformCard
        src="platform_google_deepmind_veo.png"
        label="Google DeepMind Veo"
        url="deepmind.google / models / veo"
        left={96}
        top={220}
        delay={18}
        zoomX={-120}
        zoomY={-70}
      />
      <PlatformCard
        src="platform_runway_gen4.png"
        label="Runway Gen-4"
        url="runwayml.com / research / introducing-runway-gen-4"
        left={1010}
        top={220}
        delay={52}
        zoomX={-190}
        zoomY={-42}
      />
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          left: 126,
          bottom: 80 + noteIn,
          width: 1260,
          height: 128,
          background: colors.white,
          opacity: clampInterpolate(frame, [235, 260], [0, 1]),
        }}
      >
        <div style={{...titleStyle, position: 'absolute', left: 34, top: 24, fontSize: 34, color: colors.red}}>
          结论不是“AI 自动生成已经完美”
        </div>
        <div style={{position: 'absolute', left: 36, top: 72, fontSize: 28, color: colors.ink}}>
          结论是：生成能力进入可用区间，真正要解决的是稳定、可控、可复用。
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 116,
          bottom: 82,
          width: 360,
          height: 126,
          background: '#fff',
          border: `4px dashed ${colors.red}`,
          borderRadius: 8,
          padding: '18px 20px',
          boxSizing: 'border-box',
          color: colors.ink,
          fontSize: 23,
          lineHeight: 1.26,
        }}
      >
        Sora 官网截图触发验证页，这类来源不能靠强行绕过，要改用摘要、链接或授权素材。
      </div>
    </>
  );
};

const StepChain: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ['调研', '脚本', '声音', '数字人', '素材', '包装', '质检'];
  return (
    <div style={{position: 'absolute', left: 110, bottom: 96, width: 1510, height: 120}}>
      {steps.map((step, index) => {
        const visible = clampInterpolate(frame, [72 + index * 15, 92 + index * 15], [0, 1]);
        const left = index * 208;
        return (
          <React.Fragment key={step}>
            <div
              style={{
                position: 'absolute',
                left,
                top: 18,
                width: 146,
                height: 74,
                opacity: visible,
                background: index <= Math.floor(Math.max(0, frame - 90) / 38) ? colors.red : colors.white,
                color: index <= Math.floor(Math.max(0, frame - 90) / 38) ? '#fff' : colors.ink,
                border: `5px solid ${colors.ink}`,
                borderRadius: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              {step}
            </div>
            {index < steps.length - 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: left + 154,
                  top: 53,
                  width: 42,
                  height: 5,
                  background: colors.ink,
                  opacity: visible,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ClipWindow: React.FC<{src: string; label: string; left: number; top: number; delay: number}> = ({
  src,
  label,
  left,
  top,
  delay,
}) => {
  const frame = useCurrentFrame();
  const enter = clampInterpolate(frame, [delay, delay + 26], [70, 0]);
  const opacity = clampInterpolate(frame, [delay, delay + 18], [0, 1]);
  return (
    <div
      style={{
        ...handBorder,
        position: 'absolute',
        left,
        top: top + enter,
        width: 505,
        height: 326,
        background: '#fff',
        overflow: 'hidden',
        opacity,
      }}
    >
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: colors.ink, color: '#fff', zIndex: 5}}>
        <div style={{position: 'absolute', left: 18, top: 9, fontSize: 22, fontWeight: 900}}>{label}</div>
      </div>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{
          position: 'absolute',
          left: 0,
          top: 46,
          width: '100%',
          height: 280,
          objectFit: 'cover',
          filter: 'contrast(1.05) saturate(0.88)',
        }}
      />
    </div>
  );
};

const WorkflowSegment: React.FC = () => (
  <>
    <PaperTitle top={82} size={60}>第三步：不是做按钮，是做一条生产链</PaperTitle>
    <div
      style={{
        position: 'absolute',
        left: 116,
        top: 184,
        width: 1280,
        fontSize: 36,
        lineHeight: 1.28,
        color: colors.ink,
      }}
    >
      这类视频要像“导演系统”：每一步能检查、能替换、能回滚，而不是一次性拼出一个结果。
    </div>
    <ClipWindow src="electronics_at_work_sample_8s.mp4" label="公开视频素材 / 工业流程" left={112} top={342} delay={48} />
    <ClipWindow src="usingthe1947_sample_8s.mp4" label="公开视频素材 / 使用场景" left={706} top={310} delay={82} />
    <ClipWindow src="typesett1960_sample_8s.mp4" label="公开视频素材 / 内容生产" left={1300} top={342} delay={116} />
    <StepChain />
  </>
);

const SystemSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = clampInterpolate(frame, [0, 96, 210, 350], [0.76, 0.76, 1.16, 1.22]);
  const tx = clampInterpolate(frame, [0, 96, 210, 350], [0, 0, -160, -214]);
  const ty = clampInterpolate(frame, [0, 96, 210, 350], [0, 0, -62, -92]);
  const checks = ['官网截图入库', '报告页变焦标注', '外部素材采样', '本地训练声音', '横屏时间线合成', '发布前人工审核'];

  return (
    <>
      <PaperTitle top={104} size={60}>第四步：我们现在已经跑通哪些部分？</PaperTitle>
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          left: 96,
          top: 208,
          width: 1120,
          height: 592,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <img
          src={staticFile('studio_assets.png')}
          style={{
            width: 1220,
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
        <Marker x={566} y={310} width={288} delay={236} />
        <div
          style={{
            position: 'absolute',
            right: 30,
            bottom: 28,
            background: colors.red,
            color: '#fff',
            padding: '13px 18px',
            borderRadius: 7,
            fontSize: 26,
            fontWeight: 900,
          }}
        >
          重点是稳定流程，不是一个按钮
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 112,
          top: 210,
          width: 530,
          height: 585,
        }}
      >
        {checks.map((item, index) => {
          const opacity = clampInterpolate(frame, [50 + index * 28, 72 + index * 28], [0, 1]);
          return (
            <div
              key={item}
              style={{
                position: 'absolute',
                left: 0,
                top: index * 84,
                width: 530,
                height: 62,
                opacity,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  background: colors.green,
                  color: '#fff',
                  border: `4px solid ${colors.ink}`,
                  fontSize: 27,
                  fontWeight: 900,
                  lineHeight: '34px',
                  textAlign: 'center',
                }}
              >
                ✓
              </div>
              <div style={{fontSize: 34, fontWeight: 900, color: colors.ink}}>{item}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const IssueSegment: React.FC = () => {
  const frame = useCurrentFrame();
  const issues = ['素材授权和可复用来源', '数字人动作真实感', '长视频节奏和转场密度', '口型一致性', '发布前审核门槛'];
  const next = ['优先走官方 API 和开放素材库', '数字人只保留头像小窗', '动效绑定旁白句子，不做随机运动', '每条来源保留截图、链接和时间戳'];

  return (
    <>
      <PaperTitle top={104} size={62}>最后：这版能证明方向，但还不是最终形态</PaperTitle>
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          left: 112,
          top: 218,
          width: 760,
          height: 600,
          background: colors.white,
        }}
      >
        <div style={{...titleStyle, position: 'absolute', left: 40, top: 34, fontSize: 42, color: colors.red}}>还没解决完</div>
        {issues.map((item, index) => {
          const opacity = clampInterpolate(frame, [46 + index * 26, 66 + index * 26], [0, 1]);
          return (
            <div
              key={item}
              style={{
                position: 'absolute',
                left: 44,
                top: 118 + index * 82,
                width: 660,
                opacity,
                fontSize: 32,
                color: colors.ink,
                display: 'flex',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <span style={{color: colors.red, fontWeight: 900}}>0{index + 1}</span>
              <span>{item}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          left: 946,
          top: 218,
          width: 772,
          height: 354,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <img
          src={staticFile('platform_openai_sora_probe.png')}
          style={{position: 'absolute', left: 0, top: 0, width: 772, height: 354, objectFit: 'cover'}}
        />
        <div style={{position: 'absolute', left: 22, bottom: 22, background: colors.red, color: '#fff', padding: '10px 14px', fontSize: 24, fontWeight: 900}}>
          反爬/验证：不绕过，换来源策略
        </div>
      </div>
      <div
        style={{
          ...handBorder,
          position: 'absolute',
          left: 946,
          top: 600,
          width: 772,
          height: 238,
          background: colors.white,
        }}
      >
        <div style={{...titleStyle, position: 'absolute', left: 28, top: 22, fontSize: 34, color: colors.blue}}>下一版规则</div>
        {next.map((item, index) => (
          <div
            key={item}
            style={{
              position: 'absolute',
              left: 34,
              top: 80 + index * 39,
              width: 690,
              fontSize: 24,
              lineHeight: 1.2,
              color: colors.ink,
              opacity: clampInterpolate(frame, [112 + index * 18, 132 + index * 18], [0, 1]),
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </>
  );
};

export const CodexDocumentaryStyle: React.FC = () => {
  const frame = useCurrentFrame();
  const paperPan = interpolate(frame, [0, 1800], [0, -96]);

  return (
    <AbsoluteFill style={{background: colors.paper, overflow: 'hidden', ...bodyStyle}}>
      <Audio src={staticFile('style_probe_v2_energetic.wav')} volume={0.98} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(23,21,18,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(198,40,40,0.06), transparent 46%)',
          backgroundSize: '28px 28px, 100% 100%',
          transform: `translateY(${paperPan}px)`,
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
          zIndex: 40,
        }}
      />
      <div style={{position: 'absolute', left: 80, top: 56, fontSize: 28, color: colors.muted, fontWeight: 700, zIndex: 30}}>
        内部风格测试 / 横屏模板 / 不可直接发布
      </div>
      <div style={{...titleStyle, position: 'absolute', right: 82, top: 48, fontSize: 34, color: colors.red, zIndex: 30}}>
        CODEX VIDEO LAB
      </div>

      <Sequence from={0} durationInFrames={90}>
        <IntroSegment />
      </Sequence>
      <Sequence from={90} durationInFrames={330}>
        <OfficialSourceSegment />
      </Sequence>
      <Sequence from={420} durationInFrames={330}>
        <PlatformSegment />
      </Sequence>
      <Sequence from={750} durationInFrames={330}>
        <WorkflowSegment />
      </Sequence>
      <Sequence from={1080} durationInFrames={360}>
        <SystemSegment />
      </Sequence>
      <Sequence from={1440} durationInFrames={360}>
        <IssueSegment />
      </Sequence>

      {frame >= 750 && frame < 1440 ? <AvatarBadge /> : null}
    </AbsoluteFill>
  );
};
