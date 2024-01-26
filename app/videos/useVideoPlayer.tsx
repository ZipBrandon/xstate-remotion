import { useEffect, useMemo } from "react";
import { useWatchedVideos } from "~/videos/WatchedVideoRadixProvider.tsx";

function supportsVideoType(type) {
  return `probably`;
}

export default function useVideoPlayer({
  autoPlay,
  videoUrl,
  pageId,
  volume,
  videoThumbnail = undefined,
  extra = {},
}: {
  autoPlay: boolean;
  videoUrl: string;
  pageId: string;
  volume: number;
  videoThumbnail?: string;
  extra;
}) {
  const {
    watchedVideoHandler,
    seekTo,
    getCurrentTime,
    isPlaying,
    setPlaying,
    getDuration,
    setIsDisplayed,
    setOnEnded,
    setOnError,
    setVolume,
    setThumbnail,
    seekToPercent,
    unloadVideo,
    loadVideo,
  } = useWatchedVideos()!;

  useEffect(() => {
    setPlaying(autoPlay);
  }, [autoPlay, setPlaying]);

  useEffect(() => {
    setThumbnail(videoThumbnail);
  }, [setThumbnail, videoThumbnail]);

  useEffect(() => {
    setIsDisplayed(true);

    return () => {
      setIsDisplayed(false);
    };
  }, [setIsDisplayed]);

  useEffect(() => {
    const onEnded = (e) => {
      watchedVideoHandler(pageId);
      setPlaying(false);
    };
    setOnEnded(onEnded);

    return () => {
      setOnEnded((e) => {});
    };
  }, [pageId, setOnEnded, setPlaying, watchedVideoHandler]);

  useEffect(() => {
    setOnError(async (e) => {
      console.error({
        extra: {
          typeOfError: `general`,
          message: e?.message,
          videoError: e,
          videoUrl,
          currentPageId: pageId,
          // playing: isPlaying,
          autoPlay,
          canPlayH264: supportsVideoType(`h264`),
          ...extra,
        },
      });
    });

    return () => {
      setOnError(() => {});
    };
  }, [autoPlay, pageId, setOnError, videoUrl, extra, watchedVideoHandler]);

  useEffect(() => {
    const v = volume ?? 1;
    setVolume(v);
  }, [setVolume, volume]);

  const context = useMemo(
    () => ({
      isPlaying,
      getCurrentTime,
      setPlaying,
      seekTo,
      getDuration,
      videoUrl,
    }),
    [isPlaying, getCurrentTime, setPlaying, seekTo, getDuration, videoUrl]
  );

  //////////// Cleanup ////////////
  useEffect(() => {
    loadVideo(videoUrl);
    return () => {
      unloadVideo();
    };
  }, [loadVideo, unloadVideo, videoUrl]);

  return context;
}
