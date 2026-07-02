import React from 'react';

interface NoiseTextureProps {
  className?: string;
  style?: React.CSSProperties;
}

export function NoiseTexture({ className, style }: NoiseTextureProps) {
  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.15" />
    </svg>
  );
}
