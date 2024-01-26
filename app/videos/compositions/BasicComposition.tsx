"use client";
import { useSelector } from "@xstate/react";
import React, { memo } from "react";
import { AbsoluteFill } from "remotion";
import { useZipDealVideoRef } from "../ZipDealVideoRefProvider.tsx";

export const BasicComposition = memo(
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

    if (!src) {
      return null;
    }

    return <AbsoluteFill></AbsoluteFill>;
  },
);

BasicComposition.displayName = `BasicComposition`;
