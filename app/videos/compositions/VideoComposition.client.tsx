"use client";
import { TransitionSeries } from "@remotion/transitions";
import { useSelector } from "@xstate/react";
import React, { memo } from "react";
import { AbsoluteFill, Video } from "remotion";
import { useZipDealVideoRef } from "../VideoRefProvider.tsx";

export const VideoComposition = memo(
  ({
    videoRef,
    className = ``,
    videoDurationInFrames,
  }: {
    videoRef: React.RefObject<HTMLVideoElement>;
    className?: string;
    videoDurationInFrames: number;
  }) => {
    const { videoPlayerMachineRef } = useZipDealVideoRef();

    const src = useSelector(
      videoPlayerMachineRef,
      (snapshot) => snapshot.context.videoUrl || ``
    );

    if (!src) {
      return null;
    }

    return (
      <AbsoluteFill>
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={videoDurationInFrames}>
            <Video ref={videoRef} src={src} className={className} />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    );
  }
);

VideoComposition.displayName = `ZipVideoComposition`;
