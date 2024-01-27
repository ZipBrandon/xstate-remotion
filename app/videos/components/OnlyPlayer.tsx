import { Player, PlayerRef, RenderPoster } from "@remotion/player";
import React, { memo, useCallback, useRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { BufferManager } from "~/videos/components/BufferManager.tsx";
import { VideoComposition } from "~/videos/compositions/VideoComposition.client.tsx";

type CompositionType = React.ComponentType<{
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
  compositionWidth?: number;
  compositionHeight?: number;
  videoDurationInFrames: number;
}>;
export const OnlyPlayer = memo(function OnlyPlayer({
  compositionHeight = 720,
  compositionWidth = 1280,
  durationInFrames,
  onClick,
  playerRef,
  videoRef,
  composition,
}: {
  playerRef: React.RefObject<PlayerRef>;
  durationInFrames: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClick: (e) => void;
  compositionHeight: number;
  compositionWidth: number;
  personalizedName?: string;
  composition: string;
}) {
  const compositionMinimumDurationInFrames = 0 + 1;

  const [buffering, setBuffering] = useState(false);
  const pausedBecauseOfBuffering = useRef(false);

  const onBuffer = useCallback(() => {
    setBuffering(true);

    playerRef.current?.pause();
    pausedBecauseOfBuffering.current = true;
  }, []);

  const onContinue = useCallback(() => {
    setBuffering(false);

    // Play only if we paused because of buffering
    if (pausedBecauseOfBuffering.current) {
      pausedBecauseOfBuffering.current = false;
      playerRef.current?.play();
    }
  }, []);

  const renderPoster: RenderPoster = useCallback(() => {
    if (buffering) {
      return (
        <AbsoluteFill
          style={{
            justifyContent: `start`,
            alignItems: `end`,
            fontSize: 50,
          }}
          className={`px-4 py-2`}
        >
          <span>loading!!!!!!!!!!</span>
        </AbsoluteFill>
      );
    }

    return null;
  }, [buffering]);

  return (
    <>
      <BufferManager onBuffer={onBuffer} onContinue={onContinue}>
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
          showPosterWhenPaused
          renderPoster={renderPoster}
        />
      </BufferManager>
    </>
  );
});
