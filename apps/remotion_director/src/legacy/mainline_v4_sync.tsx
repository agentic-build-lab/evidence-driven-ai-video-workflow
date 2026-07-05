import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {syncEventById} from './sync_events_v4';
import {cnnicPdfHighlightV4} from './cnnic_pdf_bbox_v4';

const fps = 30;
const totalFrames = Math.round(54.54 * fps);

const colors = {
  paper: '#f3ead6',
  ink: '#171512',
  red: '#c62828',
  blue: '#2458a6',
  green: '#2d7658',
  muted: '#665f52',
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

const hardBorder: React.CSSProperties = {
  border: `5px solid ${colors.ink}`,
  borderRadius: 8,
  boxShadow: '9px 9px 0 rgba(23,21,18,0.16)',
};

const cameraEase = Easing.bezier(0.18, 0, 0.04, 1);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const eventProgress = (frame: number, id: string) => {
  const event = syncEventById[id];
  return clamp((frame - event.startFrame) / Math.max(1, event.durationFrame));
};

const eventFade = (frame: number, id: string, frames = 18) => {
  const event = syncEventById[id];
  return interpolate(frame, [event.startFrame, event.startFrame + frames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

const afterEventStart = (frame: number, id: string) => frame >= syncEventById[id].startFrame;
const beforeEventEnd = (frame: number, id: string) => frame < syncEventById[id].endFrame;

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

const SectionTitle: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 58}) => (
  <div
    style={{
      ...titleStyle,
      position: 'absolute',
      left: 86,
      top: 72,
      width: 1540,
      fontSize: size,
      lineHeight: 1.08,
      color: colors.ink,
      zIndex: 20,
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
    <div
      style={{
        ...titleStyle,
        position: 'absolute',
        left: 18,
        top: 76,
        zIndex: 20,
        background: colors.red,
        color: '#fff',
        padding: '8px 13px',
        fontSize: 24,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 58, bottom: 0, overflow: 'hidden'}}>{children}</div>
  </div>
);

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

const CuePill: React.FC<{frame: number}> = ({frame}) => {
  const active = Object.values(syncEventById).find((event) => frame >= event.startFrame && frame < event.endFrame);
  if (!active) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 82,
        bottom: 36,
        maxWidth: 760,
        background: 'rgba(255,253,245,0.92)',
        border: `3px solid ${colors.ink}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 18,
        color: colors.muted,
        zIndex: 55,
      }}
    >
      sync cue: {active.narration}
    </div>
  );
};

const OfficialSyncScene: React.FC<{frame: number}> = ({frame}) => {
  const zoomProgress = eventProgress(frame, 'official_zoom_to_key_sentence');
  const highlightProgress = eventProgress(frame, 'official_highlight_key_sentence');
  const reportOpacity = eventFade(frame, 'official_pages_visible', 20);
  const scale = interpolate(zoomProgress, [0, 1], [0.34, 0.67], {
    easing: cameraEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tx = interpolate(zoomProgress, [0, 1], [260, -70], {
    easing: cameraEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(zoomProgress, [0, 1], [-20, -90], {
    easing: cameraEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const highlightLineBoxes = cnnicPdfHighlightV4.lineBoxes;

  return (
    <>
      <SectionTitle>先别念结论，先把来源摆出来</SectionTitle>
      <BrowserFrame
        label="CNNIC 官方报告"
        url="cnnic.com.cn / 第55次《中国互联网络发展状况统计报告》"
        left={82}
        top={184}
        width={1180}
        height={704}
      >
        <div
          style={{
            position: 'absolute',
            left: tx,
            top: ty,
            width: 1820,
            height: 2573,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <img src={staticFile('official_cnnic_page_40.png')} style={{position: 'absolute', left: 0, top: 0, width: 1820}} />
          {highlightLineBoxes.map((line, index) => {
            const lineProgress = clamp(highlightProgress * highlightLineBoxes.length - index);
            const markerWidth = line.width * lineProgress;
            return (
              <React.Fragment key={`${line.x}-${line.y}-${index}`}>
                <div
                  style={{
                    position: 'absolute',
                    left: line.x,
                    top: line.y,
                    width: markerWidth,
                    height: line.height,
                    border: `6px solid ${colors.red}`,
                    background: 'rgba(198,40,40,0.08)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    opacity: lineProgress > 0.02 ? 1 : 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: line.x,
                    top: line.y + line.height + 12,
                    width: markerWidth,
                    height: 12,
                    background: 'rgba(198,40,40,0.72)',
                    opacity: lineProgress > 0.02 ? 1 : 0,
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>
      </BrowserFrame>
      <BrowserFrame label="新华网来源" url="news.cn / 网络视听发展研究报告" left={1314} top={184} width={488} height={336}>
        <img src={staticFile('official_xinhua_network_av_2026_full.png')} style={{position: 'absolute', left: -128, top: -180, width: 740}} />
      </BrowserFrame>
      <div
        style={{
          ...hardBorder,
          position: 'absolute',
          left: 1314,
          top: 554,
          width: 488,
          height: 208,
          background: colors.white,
          padding: '26px 30px',
          boxSizing: 'border-box',
          opacity: reportOpacity,
          fontSize: 30,
          lineHeight: 1.3,
          color: colors.ink,
        }}
      >
        旁白讲“官网来源”时先给全景；讲“推近关键句”时才开始变焦；讲数字时红框和下划线出现。
      </div>
    </>
  );
};

const PlatformPanel: React.FC<{
  frame: number;
  src: string;
  label: string;
  x: number;
  y: number;
  activeId: string;
}> = ({frame, src, label, x, y, activeId}) => {
  const reveal = eventFade(frame, 'platform_tool_landscape', 24);
  const active = afterEventStart(frame, activeId) && beforeEventEnd(frame, activeId);
  const activeProgress = eventProgress(frame, activeId);
  const scale = active ? interpolate(activeProgress, [0, 1], [0.58, 0.72], {easing: cameraEase}) : 0.58;
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
        opacity: reveal,
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
          filter: active ? 'contrast(1.04)' : 'saturate(0.7) contrast(0.9)',
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

const PlatformSyncScene: React.FC<{frame: number}> = ({frame}) => (
  <>
    <SectionTitle>工具进入可用区间，但还不是“完美自动化”</SectionTitle>
    <div
      style={{
        ...hardBorder,
        position: 'absolute',
        left: 92,
        top: 184,
        width: 760,
        height: 420,
        background: colors.white,
        opacity: eventFade(frame, 'platform_not_perfect', 18),
        padding: '44px 48px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{...titleStyle, fontSize: 46, color: colors.red, marginBottom: 26}}>不是“已经完美”</div>
      <div style={{fontSize: 34, lineHeight: 1.32, color: colors.ink}}>
        这一句出来时，画面先把风险说清楚，再进入平台对比。
      </div>
    </div>
    <PlatformPanel frame={frame} src="platform_google_deepmind_veo.png" label="Veo / 可用阶段" x={90} y={184} activeId="platform_available_stage" />
    <PlatformPanel frame={frame} src="platform_runway_gen4.png" label="Runway / 连贯性" x={1010} y={184} activeId="platform_available_stage" />
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
        opacity: eventFade(frame, 'platform_control_problem', 18),
      }}
    >
      旁白说“稳定、可控、可复用”时，结论卡才出现，避免画面提前泄题。
    </div>
  </>
);

const FlowNode: React.FC<{frame: number; text: string; index: number}> = ({frame, text, index}) => {
  const firstGroup = index < 3;
  const eventId = firstGroup ? 'workflow_research_script_voice' : 'workflow_avatar_assets_packaging_qc';
  const groupIndex = firstGroup ? index : index - 3;
  const groupSize = firstGroup ? 3 : 4;
  const event = syncEventById[eventId];
  const start = event.startFrame + groupIndex * Math.floor(event.durationFrame / groupSize);
  const visible = interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const active = frame >= start + 12;

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

const WorkflowSyncScene: React.FC<{frame: number}> = ({frame}) => {
  const steps = ['调研', '脚本', '声音', '数字人', '素材', '包装', '质检'];
  const secondClip = afterEventStart(frame, 'workflow_director_system');
  return (
    <>
      <SectionTitle>不是按钮，是一条按旁白展开的生产链</SectionTitle>
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
          opacity: eventFade(frame, 'workflow_not_button', 16),
        }}
      >
        <div style={{...titleStyle, fontSize: 46, color: colors.red, marginBottom: 22}}>导演系统</div>
        <div style={{fontSize: 34, lineHeight: 1.34, color: colors.ink}}>
          说到“调研、脚本、声音”时，前三个节点才亮；说到“数字人、素材、包装和质检”时，后四个节点继续展开。
        </div>
      </div>
      {steps.map((step, index) => (
        <FlowNode key={step} text={step} index={index} frame={frame} />
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
          height: 170,
          color: colors.ink,
          fontSize: 28,
          lineHeight: 1.24,
          fontWeight: 900,
          opacity: eventFade(frame, 'workflow_director_system', 18),
        }}
      >
        讲到“导演系统”时，引用视频窗口切换为第二个样本。
      </div>
    </>
  );
};

const SystemSyncScene: React.FC<{frame: number}> = ({frame}) => {
  const checks = [
    {label: '官网截图入库', eventId: 'system_source_capture'},
    {label: '报告页推近标注', eventId: 'system_source_capture'},
    {label: '外部视频素材拉取', eventId: 'system_external_video_voice'},
    {label: '柔化马赛克', eventId: 'system_external_video_voice'},
    {label: '训练声线', eventId: 'system_external_video_voice'},
    {label: '产品页面演示', eventId: 'system_product_demo'},
  ];
  const zoomProgress = eventProgress(frame, 'system_product_demo');
  const scale = interpolate(zoomProgress, [0, 1], [0.82, 1.14], {easing: cameraEase});
  const tx = interpolate(zoomProgress, [0, 1], [0, -148], {easing: cameraEase});
  const ty = interpolate(zoomProgress, [0, 1], [0, -56], {easing: cameraEase});

  return (
    <>
      <SectionTitle>跑通哪些能力，也跟着旁白逐项亮起</SectionTitle>
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
            key={item.label}
            style={{
              height: 74,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: eventFade(frame, item.eventId, 18 + index * 3),
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
            <div style={{fontSize: 34, fontWeight: 900, color: colors.ink}}>{item.label}</div>
          </div>
        ))}
      </div>
      <AvatarBadge />
    </>
  );
};

const IssuesSyncScene: React.FC<{frame: number}> = ({frame}) => {
  const issues = [
    {label: '素材授权', eventId: 'issue_asset_license'},
    {label: '动作真实感', eventId: 'issue_motion_realism'},
    {label: '长视频节奏', eventId: 'issue_long_rhythm'},
    {label: '口型一致性', eventId: 'issue_lip_sync'},
    {label: '发布前审核', eventId: 'issue_review_gate'},
  ];
  return (
    <>
      <SectionTitle>问题列表也要跟旁白逐项出现</SectionTitle>
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
            key={issue.label}
            style={{
              height: 70,
              fontSize: 33,
              color: colors.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              opacity: eventFade(frame, issue.eventId, 12),
            }}
          >
            <span style={{color: colors.red, fontWeight: 900}}>0{index + 1}</span>
            <span>{issue.label}</span>
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
          opacity: eventFade(frame, 'close_next_iteration', 18),
        }}
      >
        到“下一版继续打磨”这句话时，收束到处理规则：验证码不绕过，授权和审核先过关。
      </div>
      <AvatarBadge />
    </>
  );
};

export const CodexMainlineSyncV4: React.FC = () => {
  const frame = useCurrentFrame();
  const bgShift = interpolate(frame, [0, totalFrames], [0, -72], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scene =
    frame < syncEventById.platform_not_perfect.startFrame ? (
      <OfficialSyncScene frame={frame} />
    ) : frame < syncEventById.workflow_not_button.startFrame ? (
      <PlatformSyncScene frame={frame} />
    ) : frame < syncEventById.system_source_capture.startFrame ? (
      <WorkflowSyncScene frame={frame} />
    ) : frame < syncEventById.issue_asset_license.startFrame ? (
      <SystemSyncScene frame={frame} />
    ) : (
      <IssuesSyncScene frame={frame} />
    );

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
        MAINLINE V4 / sync event timeline / 内部样片
      </div>
      <div style={{...titleStyle, position: 'absolute', right: 82, top: 38, fontSize: 32, color: colors.red, zIndex: 50}}>
        CODEX VIDEO LAB
      </div>
      {scene}
    </AbsoluteFill>
  );
};
