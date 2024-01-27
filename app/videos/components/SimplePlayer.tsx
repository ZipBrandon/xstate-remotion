import { Player, PlayerRef } from "@remotion/player";
import React, { memo } from "react";
import { VideoComposition } from "~/videos/compositions/VideoComposition.client.tsx";

type CompositionType = React.ComponentType<{
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
  compositionWidth?: number;
  compositionHeight?: number;
  videoDurationInFrames: number;
}>;
export const SimplePlayer = memo(function OnlyPlayer({
  compositionHeight = 720,
  compositionWidth = 1280,
  durationInFrames,
  onClick,
  playerRef,
  videoRef,
}: {
  playerRef: React.RefObject<PlayerRef>;
  durationInFrames: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClick: (e) => void;
  compositionHeight: number;
  compositionWidth: number;
  personalizedName?: string;
}) {
  const compositionMinimumDurationInFrames = 0 + 1;

  return (
    <>
      <Player
        ref={playerRef}
        component={VideoComposition}
        durationInFrames={Math.floor(durationInFrames) || 10000}
        compositionHeight={compositionHeight}
        compositionWidth={compositionWidth}
        fps={30}
        inputProps={{
          videoRef: videoRef,
          className: `absolute bottom-0 left-0 right-0 top-0 z-0 block h-full w-full bg-white object-cover`,
          videoDurationInFrames:
            durationInFrames || compositionMinimumDurationInFrames,
        }}
      />
    </>
  );
});
