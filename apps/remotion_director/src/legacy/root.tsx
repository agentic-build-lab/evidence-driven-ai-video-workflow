import React from 'react';
import {Composition} from 'remotion';
import {CodexDocumentaryStyle} from './video';
import {CodexMainlineV3} from './mainline_v3';
import {CodexMainlineSyncV4} from './mainline_v4_sync';
import {CodexV5Sample45s, v5DurationFrames} from './v5_sample_45s';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CodexDocumentaryStyle"
        component={CodexDocumentaryStyle}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CodexMainlineV3"
        component={CodexMainlineV3}
        durationInFrames={1640}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CodexMainlineSyncV4"
        component={CodexMainlineSyncV4}
        durationInFrames={1640}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CodexV5Sample45s"
        component={CodexV5Sample45s}
        durationInFrames={v5DurationFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
