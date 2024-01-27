import React, { memo, useCallback } from "react";
import {
  useCurrentVideoProgress,
  useWatchedVideos,
} from "~/videos/WatchedVideoRadixProvider.tsx";
import { zipClsx } from "~/zipClsx.ts";
import { VideoProgressIndicator } from "~/videos/components/VideoProgressIndicator.tsx";

interface VideoControlsProps {
  contentWidth: number;
  forceFauxScreen: boolean;
}

export const VideoControls = memo(function VideoControls({
  contentWidth,
  forceFauxScreen,
}: VideoControlsProps) {
  const {
    seekTo,
    seekRelativeSeconds,
    isPlaying,
    preferFauxScreen,
    togglePlaying,
  } = useWatchedVideos()!;

  const { currentProgress, isVideoEnded } = useCurrentVideoProgress();

  const isProgressing = currentProgress > 0 && currentProgress < 1;
  const isPlayingFauxScreen =
    isProgressing && (forceFauxScreen || preferFauxScreen);

  const onPlayPauseClick = useCallback(() => {
    if (isVideoEnded) seekTo(0);
    togglePlaying();
  }, [isVideoEnded, seekTo, togglePlaying]);

  const onRewindClick = useCallback(() => {
    seekRelativeSeconds(-5);
  }, [seekRelativeSeconds]);
  const onFwdClick = useCallback(() => {
    seekRelativeSeconds(5);
  }, [seekRelativeSeconds]);

  return (
    <div
      id={`video-controls-container`}
      style={{ width: contentWidth }}
      className={zipClsx({
        [`mx-auto`]: true,
        [`bg-white/70 pb-2 backdrop-blur-sm`]: !isPlayingFauxScreen,
      })}
    >
      <VideoProgressIndicator contentWidth={contentWidth} />
      <div
        id={`video-controls`}
        className={zipClsx({
          [`relative mx-auto flex h-full items-center justify-center`]: true,
          [``]: isPlayingFauxScreen,
        })}
      >
        <div className={`relative grid grid-cols-3 items-center gap-10  `}>
          <button
            className={`relative w-8 md:w-10`}
            type={`button`}
            onClick={onRewindClick}
          >
            R
          </button>
          <button
            className={`cursor-pointer`}
            data-testid={isPlaying ? `playbutton:playing` : `playbutton:paused`}
            onClick={onPlayPauseClick}
          >
            {!isPlaying ? "PLAY" : "PAUSE"}
          </button>
          <button
            className={zipClsx(
              `relative w-8 md:w-10 justify-self-end hidden opacity-50`
            )}
            type={`button`}
            onClick={onFwdClick}
          >
            FF
          </button>
        </div>
        <div
          className={zipClsx({
            [`absolute right-0`]: true,
            [`right-0`]: !isPlayingFauxScreen,
            [`right-2`]: isPlayingFauxScreen,
          })}
        ></div>
      </div>
    </div>
  );
});
