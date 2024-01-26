import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { defaultStyles } from "~/videos/ZipDealVideoRefProvider.tsx";
import { zipClsx } from "~zipdeal-ui/utilities/zipClsx.ts";

export const BouncyTitleScreen: React.FC<{
  children;
  className?: string;
}> = ({ children, className = `` }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });
  return (
    <AbsoluteFill
      className={zipClsx(`bg-brand-primary text-white`, className)}
      style={{
        ...defaultStyles,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(progress, [0, 1], [1000, 0])}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
