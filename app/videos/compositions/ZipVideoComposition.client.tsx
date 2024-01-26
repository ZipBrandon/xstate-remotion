"use client";
import { TransitionSeries } from "@remotion/transitions";
import { useSelector } from "@xstate/react";
import React, { memo } from "react";
import { AbsoluteFill, Video } from "remotion";
import { PausableVideo } from "~/videos/components/PausableVideo.tsx";
import { useZipDealVideoRef } from "../ZipDealVideoRefProvider.tsx";

export const ZipVideoComposition = memo(
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

    const src = useSelector(videoPlayerMachineRef, (snapshot) => snapshot.context.videoUrl || ``);

    console.log(`VideosCompositionsZipVideoCompositionClient`, { src });
    if (!src) {
      return null;
    }

    return (
      <AbsoluteFill>
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={videoDurationInFrames}>
            <PausableVideo ref={videoRef} src={src} className={className} />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    );
  },
);

ZipVideoComposition.displayName = `ZipVideoComposition`;
