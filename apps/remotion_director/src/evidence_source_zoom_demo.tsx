import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {cnnicPdfHighlightV4} from './cnnic_pdf_bbox_v4';

const colors = {
  paper: '#f3ead6',
  ink: '#171512',
  red: '#c62828',
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

const ease = Easing.bezier(0.18, 0, 0.04, 1);
const clamp = (value: number) => Math.max(0, Math.min(1, value));

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

const CueCard: React.FC<{frame: number}> = ({frame}) => {
  const cues = [
    {start: 0, end: 88, text: '先展示完整来源，让机构、域名、标题可见'},
    {start: 88, end: 178, text: '旁白说到关键句时，镜头才开始推近'},
    {start: 178, end: 276, text: '说到数字时，逐行红框和下划线出现'},
    {start: 276, end: 360, text: '输出同时保留来源清单、bbox 和检查帧'},
  ];
  const active = cues.find((cue) => frame >= cue.start && frame < cue.end) ?? cues[0];
  return (
    <div
      style={{
        ...hardBorder,
        position: 'absolute',
        left: 1314,
        top: 560,
        width: 488,
        minHeight: 190,
        background: colors.white,
        padding: '26px 30px',
        boxSizing: 'border-box',
        fontSize: 31,
        lineHeight: 1.32,
        color: colors.ink,
      }}
    >
      {active.text}
    </div>
  );
};

export const EvidenceSourceZoomDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const zoomProgress = clamp((frame - 88) / 90);
  const highlightProgress = clamp((frame - 178) / 74);
  const sourceOpacity = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(zoomProgress, [0, 1], [0.34, 0.67], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tx = interpolate(zoomProgress, [0, 1], [260, -70], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ty = interpolate(zoomProgress, [0, 1], [-20, -90], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: colors.paper, overflow: 'hidden', ...bodyStyle}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(23,21,18,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(198,40,40,0.07), transparent 44%)',
          backgroundSize: '28px 28px, 100% 100%',
        }}
      />
      <div style={{...titleStyle, position: 'absolute', left: 82, top: 72, width: 1540, fontSize: 58, lineHeight: 1.08, color: colors.ink}}>
        证据型视频：先给来源，再推近到关键句
      </div>
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
            opacity: sourceOpacity,
          }}
        >
          <img src={staticFile('sample_assets/official_cnnic_page_40.png')} style={{position: 'absolute', left: 0, top: 0, width: 1820}} />
          {cnnicPdfHighlightV4.lineBoxes.map((line, index) => {
            const lineProgress = clamp(highlightProgress * cnnicPdfHighlightV4.lineBoxes.length - index);
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
        <img src={staticFile('sample_assets/official_xinhua_network_av_2026_full.png')} style={{position: 'absolute', left: -128, top: -180, width: 740}} />
      </BrowserFrame>
      <CueCard frame={frame} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, border: '22px solid #111', boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: 82, top: 42, fontSize: 26, color: colors.muted, fontWeight: 800}}>Evidence demo / source zoom / bbox highlight</div>
      <div style={{...titleStyle, position: 'absolute', right: 82, top: 38, fontSize: 32, color: colors.red}}>AI VIDEO WORKFLOW</div>
    </AbsoluteFill>
  );
};

