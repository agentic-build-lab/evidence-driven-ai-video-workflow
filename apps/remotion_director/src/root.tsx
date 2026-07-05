import React from 'react';
import {Composition} from 'remotion';
import {EvidenceSourceZoomDemo} from './evidence_source_zoom_demo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="EvidenceSourceZoomDemo"
      component={EvidenceSourceZoomDemo}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};

