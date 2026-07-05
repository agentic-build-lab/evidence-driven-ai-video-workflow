import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {cnnicPdfHighlightV4} from './cnnic_pdf_bbox_v4';

const fps = 30;
export const v5DurationFrames = Math.round(53 * fps);

const colors = {
  ink: '#14120f',
  paper: '#f4ead7',
  red: '#c62828',
  white: '#fffdf5',
  blue: '#194f9f',
  muted: '#5f5a50',
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

const ease = Easing.bezier(0.18, 0, 0.04, 1);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const seconds = (value: number) => Math.round(value * fps);

const progress = (frame: number, start: number, end: number) => clamp((frame - seconds(start)) / Math.max(1, seconds(end - start)));

const phaseOpacity = (frame: number, start: number, end: number, fade = 10) => {
  const startFrame = seconds(start);
  const endFrame = seconds(end);
  const fadeIn = interpolate(frame, [startFrame, startFrame + fade], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [endFrame - fade, endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.min(fadeIn, fadeOut);
};

const BrowserShell: React.FC<{
  label: string;
  url: string;
  children: React.ReactNode;
}> = ({label, url, children}) => (
  <div
    style={{
      position: 'absolute',
      left: 92,
      top: 150,
      width: 1280,
      height: 770,
      background: '#fff',
      border: `5px solid ${colors.ink}`,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '10px 10px 0 rgba(20,18,15,0.18)',
    }}
  >
    <div style={{height: 58, background: '#ecf0f4', borderBottom: `4px solid ${colors.ink}`, position: 'relative'}}>
      <div style={{position: 'absolute', left: 18, top: 20, display: 'flex', gap: 8}}>
        {['#df4b42', '#efbd3b', '#48a85c'].map((dot) => (
          <div key={dot} style={{width: 13, height: 13, borderRadius: 7, background: dot, border: '2px solid #111'}} />
        ))}
      </div>
      <div
        style={{
          ...bodyStyle,
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
        left: 20,
        top: 76,
        zIndex: 5,
        background: colors.red,
        color: '#fff',
        padding: '9px 14px',
        fontSize: 24,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 58, bottom: 0, overflow: 'hidden'}}>{children}</div>
  </div>
);

const PresenterBadge: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 78,
        bottom: 58,
        width: 190,
        height: 190,
        borderRadius: 96,
        overflow: 'hidden',
        border: `5px solid ${colors.ink}`,
        background: colors.paper,
        boxShadow: '7px 7px 0 rgba(20,18,15,0.18)',
        zIndex: 80,
      }}
    >
      <OffthreadVideo
        src={staticFile('v5_sample/heygen_v5_sample_45s_presenter.webm')}
        style={{
          width: 335,
          height: 190,
          marginLeft: -72,
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

const OpeningScene: React.FC<{frame: number}> = ({frame}) => {
  const p = progress(frame, 0, 7);
  const scale = interpolate(p, [0, 1], [1.02, 1.1], {easing: ease});
  const phonePing = interpolate(frame, [seconds(2.2), seconds(2.7)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  return (
    <AbsoluteFill style={{opacity: phaseOpacity(frame, 0, 7), background: '#000'}}>
      <img
        src={staticFile('v5_sample/generated_late_night_scrolling.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: '62% 50%'}}
      />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.56), rgba(0,0,0,0.04) 70%)'}} />
      <div style={{...titleStyle, position: 'absolute', left: 92, top: 108, width: 780, color: '#fff', fontSize: 58, lineHeight: 1.08}}>
        明明很累，为什么还是停不下来？
      </div>
      <div
        style={{
          ...bodyStyle,
          position: 'absolute',
          left: 100,
          top: 330,
          color: '#fff',
          fontSize: 30,
          lineHeight: 1.3,
          opacity: 0.88,
          width: 650,
        }}
      >
        本来只想刷两分钟，一抬头，半个小时过去了。
      </div>
      <div
        style={{
          ...bodyStyle,
          position: 'absolute',
          right: 360,
          top: 420,
          width: 300,
          padding: '18px 22px',
          borderRadius: 18,
          background: `rgba(255,255,255,${0.86 * phonePing})`,
          color: colors.ink,
          fontSize: 24,
          transform: `translateY(${interpolate(phonePing, [0, 1], [30, 0])}px)`,
          opacity: phonePing,
        }}
      >
        下一条，也许更有用。
      </div>
    </AbsoluteFill>
  );
};

const FeedScene: React.FC<{frame: number}> = ({frame}) => {
  const p = progress(frame, 7, 18);
  const shake = Math.sin(frame * 0.42) * 8;
  const cropX = interpolate(p, [0, 0.32, 0.66, 1], [-70, -210, 0, -130], {easing: ease});
  const scale = interpolate(p, [0, 0.32, 0.66, 1], [1.05, 1.2, 1.09, 1.18], {easing: ease});
  return (
    <AbsoluteFill style={{opacity: phaseOpacity(frame, 7, 18), background: '#05080d'}}>
      <img
        src={staticFile('v5_sample/generated_feed_montage.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translateX(${cropX + shake}px) scale(${scale})`,
          transformOrigin: '62% 58%',
          filter: 'contrast(1.08) saturate(1.06)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.08), rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.62))'}} />
      <div style={{...titleStyle, position: 'absolute', left: 92, top: 86, color: '#fff', fontSize: 54, lineHeight: 1.05, width: 860}}>
        不是先怪自己
      </div>
      <div style={{...bodyStyle, position: 'absolute', left: 98, bottom: 120, color: '#fff', fontSize: 32, width: 760, lineHeight: 1.32}}>
        你看到的不是一个视频，而是一整套争夺注意力的环境。
      </div>
    </AbsoluteFill>
  );
};

const CnnicScene: React.FC<{frame: number}> = ({frame}) => {
  const p = progress(frame, 18, 32);
  const zoom = progress(frame, 22, 27.5);
  const mark = progress(frame, 26, 32);
  const scale = interpolate(zoom, [0, 1], [0.32, 0.66], {easing: ease});
  const tx = interpolate(zoom, [0, 1], [330, -60], {easing: ease});
  const ty = interpolate(zoom, [0, 1], [-20, -92], {easing: ease});

  return (
    <AbsoluteFill style={{opacity: phaseOpacity(frame, 18, 32), background: colors.paper}}>
      <div style={{...titleStyle, position: 'absolute', left: 92, top: 64, fontSize: 54, color: colors.ink}}>
        先把官方来源摆出来
      </div>
      <BrowserShell label="CNNIC 官方报告" url="cnnic.com.cn / 第55次《中国互联网络发展状况统计报告》">
        <div style={{position: 'absolute', left: tx, top: ty, width: 1820, height: 2573, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
          <img src={staticFile('v5_sample/cnnic_report_page_40.png')} style={{position: 'absolute', left: 0, top: 0, width: 1820}} />
          {cnnicPdfHighlightV4.lineBoxes.map((line, index) => {
            const lineProgress = clamp(mark * cnnicPdfHighlightV4.lineBoxes.length - index);
            return (
              <React.Fragment key={`${line.x}-${line.y}`}>
                <div
                  style={{
                    position: 'absolute',
                    left: line.x,
                    top: line.y,
                    width: line.width * lineProgress,
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
                    width: line.width * lineProgress,
                    height: 12,
                    background: 'rgba(198,40,40,0.72)',
                    opacity: lineProgress > 0.02 ? 1 : 0,
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>
      </BrowserShell>
      <div style={{...bodyStyle, position: 'absolute', right: 92, top: 218, width: 360, fontSize: 30, lineHeight: 1.32, color: colors.ink}}>
        先看到报告身份，再推近到短视频用户规模和占比。
      </div>
    </AbsoluteFill>
  );
};

const XinhuaScene: React.FC<{frame: number}> = ({frame}) => {
  const p = progress(frame, 32, 53);
  const topOpacity = interpolate(p, [0, 0.28, 0.42], [1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const focusOpacity = interpolate(p, [0.28, 0.42, 0.66], [0, 1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const annotatedOpacity = interpolate(p, [0.58, 0.72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(p, [0, 1], [1, 1.08], {easing: ease});

  return (
    <AbsoluteFill style={{opacity: phaseOpacity(frame, 32, 53), background: colors.paper}}>
      <div style={{...titleStyle, position: 'absolute', left: 92, top: 64, fontSize: 52, color: colors.ink}}>
        再用新华社报道交叉确认
      </div>
      <BrowserShell label="新华社来源" url="news.cn / 网络视听用户 10.99 亿">
        <div style={{position: 'absolute', inset: 0, background: '#fff'}}>
          <img
            src={staticFile('v5_sample/xinhua_av_2026_top.png')}
            style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 800, objectFit: 'cover', opacity: topOpacity}}
          />
          <img
            src={staticFile('v5_sample/xinhua_av_2026_focus.png')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1280,
              height: 800,
              objectFit: 'cover',
              opacity: focusOpacity * (1 - annotatedOpacity),
              transform: `scale(${scale})`,
              transformOrigin: '36% 45%',
            }}
          />
          <img
            src={staticFile('v5_sample/xinhua_av_2026_annotated.png')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1280,
              height: 800,
              objectFit: 'cover',
              opacity: annotatedOpacity,
              transform: `scale(${scale})`,
              transformOrigin: '36% 45%',
            }}
          />
        </div>
      </BrowserShell>
      <div style={{...bodyStyle, position: 'absolute', right: 92, top: 218, width: 360, fontSize: 30, lineHeight: 1.32, color: colors.ink}}>
        说到 10.99 亿时才标注；画面推近后锁住，不再乱晃。
      </div>
    </AbsoluteFill>
  );
};

export const CodexV5Sample45s: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: colors.paper}}>
      <OpeningScene frame={frame} />
      <FeedScene frame={frame} />
      <CnnicScene frame={frame} />
      <XinhuaScene frame={frame} />
      <PresenterBadge />
      <div style={{...titleStyle, position: 'absolute', right: 78, top: 42, color: colors.red, fontSize: 30, zIndex: 90}}>V5 SAMPLE</div>
    </AbsoluteFill>
  );
};
