import { PlayerRef } from "@remotion/player";
import { useSelector } from "@xstate/react";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPlayer, getVideoElement } from "~/VideoPlayerMachine/machine.tsx";
import { PlayerEventTypes } from "~/VideoPlayerMachine/types";
import { useZipDealVideoRef } from "~/videos/VideoRefProvider.tsx";

import type { WatchedVideoContextInterface } from "./WatchedVideoTypes.d.ts";

const WatchedVideoContext = createContext<
  undefined | WatchedVideoContextInterface
>(undefined);

export const WatchedVideoRadixProvider = (props: { children: ReactNode }) => {
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const { videoPlayerMachineRef, videoPlayerSend } = useZipDealVideoRef();

  // console.log(`videoPlayerMachineRef state`, videoPlayerMachineRef.getSnapshot().value);
  // console.log(`videoContext`, videoContext);
  const player: PlayerRef | null = useSelector(
    videoPlayerMachineRef,
    (state) => {
      return getPlayer(state.context.playerRef);
    }
  );
  const videoElement = useSelector(videoPlayerMachineRef, (state) => {
    return getVideoElement(state.context.videoElementRef);
  });
  const videoDuration = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.compositionDurationInFrames * state.context.fps;
  });
  const currentTime = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.currentTime;
  });

  const isPlaying = useSelector(videoPlayerMachineRef, (state) => {
    return getPlayer(state.context.playerRef)?.isPlaying();
  });
  const isMuted = useSelector(videoPlayerMachineRef, (state) => {
    return (
      getPlayer(state.context.playerRef)?.isMuted() ||
      getVideoElement(state.context.videoElementRef)?.muted
    );
  });
  const vol = useSelector(videoPlayerMachineRef, (state) => {
    return getPlayer(state.context.playerRef)?.getVolume();
  });
  const preferFauxScreen = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.fauxScreen;
  });
  const thumbnail = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.thumbnailUrl;
  });

  const videoUrl = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.videoUrl;
  });

  const videoTag = videoElement;

  // console.log(`is Muted`, isMuted, vol);
  // const videoRef = player;

  const [isDisplayed, setIsDisplayed] = useState(false);

  ////// Handlers
  // const [onPlay, setOnPlay] = useMakeHandlers<`play`>(
  //   videoPlayerMachineRef,
  //   `play`
  // );
  // const [onPause, setOnPause] = useMakeHandlers<`pause`>(
  //   videoPlayerMachineRef,
  //   `pause`
  // );
  //
  // const [onSeek] = useMakeHandlers<`seeked`>(videoPlayerMachineRef, `seeked`);
  const [onEnded, setOnEnded] = useMakeHandlers<`ended`>(
    videoPlayerMachineRef,
    `ended`
  );
  const [onError, setOnError] = useMakeHandlers<`error`>(
    videoPlayerMachineRef,
    `error`
  );

  ////////
  const setPlaying = useCallback(
    (playing, e) => {
      // alert(`Set Playing ${playing}`);
      console.log(`Fn setPlaying`, playing, e, videoUrl);
      if (playing) {
        videoPlayerSend({ type: `video.play`, event: e });
      } else {
        videoPlayerSend({ type: `video.pause`, event: e });
      }
    },
    [videoPlayerSend, videoUrl]
  );

  const handleOnEnded = useCallback(
    (e) => {
      // alert(`handleOnEnded ${videoUrl}`);
      console.log(`Fn handleOnEnded`, videoUrl);

      onEnded?.(e);
      setPlaying(false, e);
    },
    [onEnded, setPlaying, videoUrl]
  );

  const handleOnError = useCallback(
    (e) => {
      console.log(`Fn handleOnError`, videoUrl);
      setPlaying(false, e);
      onError?.(e);
    },
    [onError, setPlaying, videoUrl]
  );

  ///// Listeners
  // useEffect(() => {
  //   if (!player) {
  //     return;
  //   }
  //   const onPlay: CallbackListener<`play`> = () => {
  //     // console.log(`play`);
  //   };
  //   const onRateChange: CallbackListener<`ratechange`> = () => {
  //     // console.log(`ratechange`, e.detail.playbackRate);
  //   };
  //   const onVolumeChange: CallbackListener<`volumechange`> = () => {
  //     // console.log(`new volume`, e.detail.volume);
  //   };
  //
  //   const onPause: CallbackListener<`pause`> = () => {
  //     // console.log(`pausing`);
  //   };
  //
  //   const onSeeked: CallbackListener<`seeked`> = () => {
  //     // console.log(`seeked to ` + e.detail.frame);
  //   };
  //
  //   const onTimeupdate: CallbackListener<`timeupdate`> = () => {
  //     // console.log(`time has updated to ` + e.detail.frame);
  //   };
  //
  //   const onEnded: CallbackListener<`ended`> = () => {
  //     // console.log(`ended`);
  //   };
  //
  //   const onError: CallbackListener<`error`> = () => {
  //     // console.log(`error`, e.detail.error);
  //   };
  //
  //   const onFullscreenChange: CallbackListener<`fullscreenchange`> = () => {
  //     // console.log(`fullscreenchange`, e.detail.isFullscreen);
  //   };
  //
  //   const onScaleChange: CallbackListener<`scalechange`> = () => {
  //     // console.log(`scalechange`, e.detail.scale);
  //   };
  //
  //   const onMuteChange: CallbackListener<`mutechange`> = () => {
  //     // console.log(`mutechange`, e.detail.isMuted);
  //   };
  //
  //   player.addEventListener(`play`, onPlay);
  //   player.addEventListener(`ratechange`, onRateChange);
  //   player.addEventListener(`volumechange`, onVolumeChange);
  //   player.addEventListener(`pause`, onPause);
  //   player.addEventListener(`ended`, onEnded);
  //   player.addEventListener(`error`, onError);
  //   player.addEventListener(`fullscreenchange`, onFullscreenChange);
  //   player.addEventListener(`scalechange`, onScaleChange);
  //   player.addEventListener(`mutechange`, onMuteChange);
  //
  //   // See below for difference between `seeked` and `timeupdate`
  //   player.addEventListener(`seeked`, onSeeked);
  //   player.addEventListener(`timeupdate`, onTimeupdate);
  //
  //   return () => {
  //     // Make sure to clean up event listeners
  //     if (player) {
  //       player.removeEventListener(`play`, onPlay);
  //       player.removeEventListener(`ratechange`, onRateChange);
  //       player.removeEventListener(`volumechange`, onVolumeChange);
  //       player.removeEventListener(`pause`, onPause);
  //       player.removeEventListener(`ended`, onEnded);
  //       player.removeEventListener(`error`, onError);
  //       player.removeEventListener(`fullscreenchange`, onFullscreenChange);
  //       player.removeEventListener(`scalechange`, onScaleChange);
  //       player.removeEventListener(`mutechange`, onMuteChange);
  //       player.removeEventListener(`seeked`, onSeeked);
  //       player.removeEventListener(`timeupdate`, onTimeupdate);
  //     }
  //   };
  // }, [player]);

  useEffect(() => {
    if (!player) return;
    const f = (e) => {
      videoPlayerSend({
        type: `video.setProgressFrame`,
        progressFrame: e.detail.frame,
      });
    };

    player.addEventListener(`timeupdate`, f);
    return () => {
      player.removeEventListener(`timeupdate`, f);
    };
  }, [player, videoPlayerSend]);

  useEffect(() => {
    if (!player) return;

    player.addEventListener(`error`, handleOnError);
    return () => {
      player.removeEventListener(`error`, handleOnError);
    };
  }, [handleOnError, player]);

  useEffect(() => {
    if (!player) return;

    player?.addEventListener(`ended`, handleOnEnded);
    return () => {
      player?.removeEventListener(`ended`, handleOnEnded);
    };
  }, [handleOnEnded, player]);

  //////////////// Listeners

  ////// Modifiers
  const setAutoPlay = useCallback(
    (autoPlay: boolean) => {
      videoPlayerSend({ type: `autoplay.set`, autoPlay });
    },
    [videoPlayerSend]
  );
  const togglePlaying = useCallback(
    (e: Event) => {
      videoPlayerSend({ type: `video.toggle`, event: e });
    },
    [videoPlayerSend]
  );

  const toggleFauxScreen = useCallback(() => {
    videoPlayerSend({ type: `display.toggle` });
  }, [videoPlayerSend]);

  const setThumbnail = useCallback(
    (thumbnailUrl: string) => {
      videoPlayerSend({ type: `video.setThumbnailUrl`, thumbnailUrl });
    },
    [videoPlayerSend]
  );
  const setPreferFauxScreen = useCallback(
    (prefers: boolean) => {
      if (prefers) videoPlayerSend({ type: `display.fauxScreen` });
      else videoPlayerSend({ type: `display.inline` });
    },
    [videoPlayerSend]
  );

  const setVolume = useCallback(
    (volume: number) => {
      videoPlayerSend({ type: `volume.set`, volume });
    },
    [videoPlayerSend]
  );

  const mute = useCallback(() => {
    videoPlayerSend({ type: `volume.mute` });
  }, [videoPlayerSend]);

  const unmute = useCallback(() => {
    videoPlayerSend({ type: `volume.unmute` });
  }, [videoPlayerSend]);

  const toggleMute = useCallback(() => {
    videoPlayerSend({ type: `volume.toggleMute` });
  }, [videoPlayerSend]);

  const seekTo = useCallback(
    (seconds: number) => {
      videoPlayerSend({ type: `control.seekToSeconds`, seconds });
    },
    [videoPlayerSend]
  );
  const seekRelativeSeconds = useCallback(
    (secondsOffset: number) => {
      videoPlayerSend({ type: `control.seekRelativeSeconds`, secondsOffset });
    },
    [videoPlayerSend]
  );

  const setPlaybackRate = useCallback(
    (playbackRate: number) => {
      videoPlayerSend({ type: `video.setPlaybackRate`, playbackRate });
    },
    [videoPlayerSend]
  );

  const loadVideo = useCallback(
    (videoUrl: string, options: { autoPlay?: boolean } = {}) => {
      videoPlayerSend({ type: `video.load`, videoUrl });

      if (options.autoPlay !== undefined) {
        const autoPlay = options.autoPlay;
        videoPlayerSend({ type: `autoplay.set`, autoPlay });
      }
    },
    [videoPlayerSend]
  );

  const unloadVideo = useCallback(() => {
    videoPlayerSend({ type: `video.unload` });
  }, [videoPlayerSend]);

  //////////

  /////// Getters
  const getDuration = useCallback(() => {
    return videoDuration;
  }, [videoDuration]);

  const seekToPercent = useCallback(
    (percent: number) => {
      videoPlayerSend({ type: `control.seekToPercent`, percent });
    },
    [videoPlayerSend]
  );
  const getCurrentTime = useCallback(() => {
    return currentTime;
  }, [currentTime]);

  //////

  const watchedVideoHandler = useCallback(
    (pageId: string) => {
      setWatchedVideos((watchedVideos) => {
        if (!watchedVideos.some((video) => video === pageId)) {
          return [...watchedVideos, pageId];
        }

        return [...watchedVideos];
      });
    },
    [setWatchedVideos]
  );

  const context = useMemo(
    () => ({
      watchedVideos,
      setWatchedVideos,
      videoTag,
      watchedVideoHandler,
      setPlaying,
      setVolume,
      getDuration,
      getCurrentTime,
      toggleFauxScreen,
      setPlaybackRate,
      mute,
      unmute,
      seekTo,
      isPlaying,
      isDisplayed,
      setIsDisplayed,
      setOnEnded,
      setOnError,
      preferFauxScreen,
      setPreferFauxScreen,
      setThumbnail,
      thumbnail,
      seekToPercent,
      seekRelativeSeconds,
      setAutoPlay,
      togglePlaying,
      unloadVideo,
      loadVideo,
      toggleMute,
      isMuted,
      vol,
    }),
    [
      watchedVideos,
      videoTag,
      watchedVideoHandler,
      setPlaying,
      setVolume,
      getDuration,
      getCurrentTime,
      toggleFauxScreen,
      setPlaybackRate,
      mute,
      unmute,
      seekTo,
      isPlaying,
      isDisplayed,
      setOnEnded,
      setOnError,
      preferFauxScreen,
      setPreferFauxScreen,
      setThumbnail,
      thumbnail,
      seekToPercent,
      seekRelativeSeconds,
      setAutoPlay,
      togglePlaying,
      unloadVideo,
      loadVideo,
      toggleMute,
      isMuted,
      vol,
    ]
  );

  return (
    <WatchedVideoContext.Provider value={context}>
      {props.children}
    </WatchedVideoContext.Provider>
  );
};

export const useCurrentVideoProgress = () => {
  // const currentProgress = useRef(0);
  const { videoPlayerMachineRef } = useZipDealVideoRef();
  const videoProgress = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.videoProgress / 100.0;
  });

  // console.log(`videoProgress`, videoProgress);

  const isVideoEnded = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.isVideoEnded;
  });

  return { currentProgress: videoProgress, isVideoEnded };
};

export const useWatchedVideos = () => {
  return useContext(WatchedVideoContext);
};

function useMakeHandlers<U extends PlayerEventTypes>(
  videoPlayerMachineRef,
  callback: U
) {
  const { send } = videoPlayerMachineRef;
  const handler = useSelector(videoPlayerMachineRef, (state) => {
    return state.context.callbacks[callback];
  });

  const setHandler = useCallback(
    (callbackFn) => {
      // console.log(`setHandler`, callbackFn);
      send({ type: `control.setCallback`, callback: callback, callbackFn });
    },
    [callback, send]
  );
  return [handler, setHandler];
}
