import { getVideoMetadata } from "@remotion/media-utils";
import { PlayerRef } from "@remotion/player";
import { RefObject } from "react";
import { assign, fromPromise, setup } from "xstate";
import type {
  PlayerEventTypes,
  SinglePlayerListeners,
  VideoPlayerMachineContext,
  VideoPlayerMachineEvents,
  VideoPlayerMachineInput,
} from "./types.d.ts";

export const getVideoElement = (
  videoPlayerRef: RefObject<HTMLVideoElement>
) => {
  return videoPlayerRef?.current;
};
export const getPlayer = (playerRef: RefObject<PlayerRef>) => {
  return playerRef?.current;
};

export const VideoPlayerMachine = setup({
  actions: {
    seekToSeconds: ({ context, self }, params: { seconds: number }) => {
      self.send({
        type: "control.seekToFrame",
        frame: params.seconds * context.fps,
      });
    },
    seekRelativeSeconds: (
      { context, self },
      params: { secondsOffset: number }
    ) => {
      const framesAdjustment = params.secondsOffset * context.fps;
      const currentFrame = context.currentFrame;

      self.send({
        type: "control.seekToFrame",
        frame: currentFrame + framesAdjustment,
      });
    },
    setProgressFrame: assign(
      ({ context }, params: { progressFrame: number }) => {
        const percent =
          (params.progressFrame / context.compositionDurationInFrames) * 100;
        return {
          currentFrame: params.progressFrame,
          videoProgress: percent,
        };
      }
    ),
    setCallback: assign({
      callbacks: (
        { context },
        params: {
          callback: PlayerEventTypes;
          callbackFn: SinglePlayerListeners[keyof SinglePlayerListeners];
        }
      ) => {
        const cbs = context.callbacks;
        const cb = params.callback;
        cbs[cb] = params.callbackFn as any;

        return cbs;
      },
    }),
    loadVideo: assign(({ self }, params: { videoUrl: string }) => {
      // const player = getPlayer(context.videoElementRef);
      // if (player) {
      //   player.src = event.videoUrl;
      // }

      console.log("loadVideo and getVideoMetadata ", params);

      getVideoMetadata(params.videoUrl).then((result) => {
        const { width, height, durationInSeconds, aspectRatio } = result;
        self.send({
          type: "video.setMetadata",
          width,
          height,
          durationInSeconds,
          aspectRatio,
        });
      });

      return {
        videoUrl: params.videoUrl,
      };
    }),
    setMetadata: assign(
      (
        { context },
        params: {
          width: number;
          height: number;
          durationInSeconds: number;
          aspectRatio: number;
        }
      ) => {
        return {
          videoDurationInSeconds: params.durationInSeconds,
          videoDurationInFrames: params.durationInSeconds * context.fps,
          compositionDurationInFrames:
            params.durationInSeconds * context.fps +
            (context.compositionExtraDurationFrames || 0),
          width: params.width,
          height: params.height,
          aspectRatio: params.aspectRatio,
          currentFrame: 0,
        };
      }
    ),
    unloadVideo: assign(({ self }) => {
      console.log("unloadVideo in machine");
      self.send({
        type: "control.seekToFrame",
        frame: 0,
      });
      return {
        videoUrl: "",
        videoDurationInSeconds: 0,
        width: 0,
        height: 0,
        currentFrame: 0,
        aspectRatio: 0,
        videoDurationInFrames: 0,
        videoProgress: 0,
        canPlay: false,
        secondsLoaded: 0,
        currentTime: 0,
        compositionDurationInFrames: 0,
        compositionExtraDurationFrames: 0,
      };
    }),
    setCompositionExtraDurationFrames: assign(
      ({ context }, params: { compositionExtraDurationFrames: number }) => {
        return {
          compositionExtraDurationFrames:
            params.compositionExtraDurationFrames || 0,
          compositionDurationInFrames:
            context.videoDurationInFrames +
            (params.compositionExtraDurationFrames || 0),
        };
      }
    ),
    setCanPlay: assign((_, params: { canPlay: boolean }) => {
      return {
        canPlay: params.canPlay,
      };
    }),
    setMute: ({ context }, params: { muted: boolean }) => {
      const player = getPlayer(context.playerRef);
      const videoElement = getVideoElement(context.videoElementRef);
      if (player && videoElement) {
        if (params.muted) {
          player.mute();
          videoElement.muted = true;
        } else {
          player.unmute();
          videoElement.muted = false;
        }
      }
    },

    setVolume: assign({
      volume: ({ context }, params: { volume: number }) => {
        const eventVolume = Math.min(Math.max(params.volume ?? 1, 0), 1);
        const player = getPlayer(context.playerRef);
        if (player) {
          player.setVolume(eventVolume);
        }
        return eventVolume;
      },
    }),
    /// Seeking

    seekToFrame: ({ context, self }, params: { frame: number }) => {
      const player = getPlayer(context.playerRef);
      if (player === null) return;

      const isPlaying = player?.isPlaying();

      player.seekTo(params.frame);

      if (isPlaying) self.send({ type: "video.play", event: undefined });
    },

    seekToPercent: ({ context, self }, params: { percent: number }) => {
      const normalizedPercent =
        params.percent > 1 ? params.percent / 100 : params.percent;
      self.send({
        type: "control.seekToFrame",
        frame: normalizedPercent * context.compositionDurationInFrames,
      });
    },
    // End Seeking
    setPlaybackRate: assign({
      playbackRate: (_, params: { playbackRate: number }) => {
        return params.playbackRate;
      },
    }),
    setThumbnailUrl: assign({
      thumbnailUrl: (_, params: { thumbnailUrl: string }) => {
        return params.thumbnailUrl;
      },
    }),
    onError: ({ event, context }) => {
      console.log("onError", context.videoUrl, event);
    },
    fauxScreenFalse: assign({ fauxScreen: false }),
    fauxScreenTrue: assign({ fauxScreen: true }),
    setAutoPlay: assign((_, params: { autoPlay: boolean }) => {
      return {
        autoPlay: params.autoPlay,
      };
    }),
    pauseEntry: ({ context }) => {
      // console.log("Paused", "onEntry", context.videoUrl, event);
      getPlayer(context.playerRef)?.pause();
    },
    setVideoEndedToFalse: assign({
      isVideoEnded: false,
    }),

    resetVideoToBeginning: () => {
      // const player = getPlayer(context.playerRef);
      // if (player === null) return;
      // player.seekTo(0) = 0;
    },
    videoToggleToPlayingConsoleLog: ({ context }) =>
      console.log(`video.toggle Paused ${context.videoUrl} > Playing`),
    videoToPauseConsoleLog: ({ context }) =>
      console.log(`video.toggle Playing ${context.videoUrl} > Paused`),
    videoPlayingEntry: ({ context }) => {
      // console.log("Playing", "onEntry", context.videoUrl, event);
      getPlayer(context.playerRef)?.play();
    },
    videoEndedToTrue: assign({
      isVideoEnded: true,
    }),
  },
  actors: {
    waitForVideoToLoad: fromPromise(async function ({
      input: { context, actor },
    }: {
      input: {
        context: VideoPlayerMachineContext;
        actor: any; //ActorRef<MachineSnapshot<VideoPlayerMachineContext>
      };
    }) {
      actor.send({ type: "video.setCanPlay", canPlay: !!context.videoUrl });
    }),
  },
  guards: {
    isSetToAutoPlay: ({ context }) => {
      console.log(`isSetToAutoPlay ${context.videoUrl}`, context.autoPlay);
      return context.autoPlay;
    },
    videoCannotPlay: ({ context }) => {
      console.log(`videoCannotPlay ${context.videoUrl}`, !context.canPlay);
      return !context.canPlay;
    },

    isVideoElementMuted: ({ context }) => {
      const muted =
        getPlayer(context.playerRef)?.isMuted() ||
        getVideoElement(context.videoElementRef)?.muted;

      return !!muted;
    },
  },
  delays: {},
  types: {
    context: {} as VideoPlayerMachineContext,
    input: {} as VideoPlayerMachineInput,
    events: {} as VideoPlayerMachineEvents,
  },
}).createMachine({
  id: "Video Player Machine",
  context: ({ input }) => {
    return {
      videoElementRef: input.videoElementRef,
      playerRef: input.playerRef,
      volume: input.volume || 1,
      videoUrl: "",
      thumbnailUrl: input.thumbnailUrl || "",
      autoPlay: input.autoPlay || false,
      fauxScreen: input.fauxScreen || true,
      compositionExtraDurationFrames: input.compositionExtraDurationFrames || 0,
      callbacks: input.callbacks || {
        seeked: () => {
          // console.log(`fullscreenchange`);
        },
        pause: () => {
          // console.log(`fullscreenchange`, e);
        },
        play: () => {
          // console.log(`fullscreenchange`, e);
        },
        ratechange: () => {
          // console.log(`fullscreenchange`, e);
        },
        scalechange: () => {
          // console.log(`fullscreenchange`, e);
        },
        volumechange: () => {
          // console.log(`fullscreenchange`, e);
        },
        ended: () => {
          // console.log(`fullscreenchange`, e);
        },
        error: () => {
          // console.log(`fullscreenchange`, e);
        },
        timeupdate: () => {
          // console.log(`fullscreenchange`, e);
        },
        frameupdate: () => {
          // console.log(`fullscreenchange`, e);
        },
        fullscreenchange: () => {
          // console.log(`fullscreenchange`, e);
        },
        mutechange: () => {
          // console.log("mutechange", e);
        },
      },
      isMobile: input.isMobile || false,
      isVideoEnded: input.isVideoEnded || false,
      playbackRate: input.playbackRate || 1,
      canPlay: false,
      secondsLoaded: 0,
      currentTime: 0,
      videoProgress: 0,
      currentFrame: 0,
      videoDurationInFrames: 0,
      compositionDurationInFrames: 0,
      width: 0,
      height: 0,
      aspectRatio: 0,
      videoDurationInSeconds: 0,
      fps: 30,
    };
  },
  initial: "Video",
  states: {
    Video: {
      id: "Video",
      initial: "Control",
      states: {
        Viewer: {
          id: "Viewer",
          initial: "Viewing",
          states: {
            Viewing: {
              on: {
                "viewer.viewed": {
                  target: "Viewed",
                },
              },
            },
            Viewed: {
              on: {
                "viewer.reset": {
                  target: "Viewing",
                },
              },
            },
          },
        },
        Control: {
          initial: "Idle",
          id: "Control",

          states: {
            Idle: {
              on: {},
            },
            Loading: {
              on: {},
              invoke: {
                src: "waitForVideoToLoad",
                input: ({ context, self }) => {
                  return {
                    context,
                    actor: self,
                  };
                },
                onDone: [
                  {
                    target: "RetryLoading",
                    guard: "videoCannotPlay",
                  },
                  {
                    target: "Playing",
                    guard: "isSetToAutoPlay",
                  },
                  {
                    target: "Paused",
                  },
                ],
                onError: {
                  target: "VideoLoadError",
                },
              },
            },
            RetryLoading: {
              after: {
                100: {
                  target: "Loading",
                },
              },
            },
            VideoLoadError: {
              entry: [],
              always: {
                target: "Idle",
              },
            },
            Playing: {
              entry: ["videoPlayingEntry", "setVideoEndedToFalse"],
              on: {
                "video.pause": {
                  target: "Paused",
                  // actions: ["videoToPauseConsoleLog"],
                },
                "video.toggle": {
                  target: "Paused",
                  // actions: ["videoToPauseConsoleLog"],
                },
                "video.finish": {
                  target: "Finished",
                },
              },
            },
            Paused: {
              entry: ["pauseEntry", "setVideoEndedToFalse"],
              on: {
                "video.play": {
                  target: "Playing",
                  // actions: ["videoToggleToPlayingConsoleLog"],
                },
                "video.toggle": {
                  target: "Playing",
                  // actions: ["videoToggleToPlayingConsoleLog"],
                },
              },
            },
            Finished: {
              entry: ["videoEndedToTrue"],
              on: {
                "video.replay": {
                  target: "Playing",
                  actions: ["resetVideoToBeginning"],
                },
              },
            },
            Unload: {
              entry: ["unloadVideo"],
              always: {
                target: "Idle",
              },
            },
          },
          on: {
            "autoplay.set": {
              actions: {
                type: "setAutoPlay",
                params: ({ event }) => ({ autoPlay: event.autoPlay }),
              },
            },
            "control.rewind": {},
            "control.seekToSeconds": {
              actions: {
                type: "seekToSeconds",
                params: {
                  seconds: 5,
                },
              },
            },
            "control.seekToFrame": {
              actions: [
                {
                  type: "seekToFrame",
                  params: ({ event }) => ({ frame: event.frame }),
                },
              ],
            },
            "control.seekRelativeSeconds": {
              actions: [
                {
                  type: "seekRelativeSeconds",
                  params: ({ event }) => ({
                    secondsOffset: event.secondsOffset,
                  }),
                },
              ],
            },
            "control.seekToPercent": {
              actions: [
                {
                  type: "seekToPercent",
                  params: ({ event }) => ({ percent: event.percent }),
                },
              ],
            },
            "control.setPlaybackRate": {
              actions: [
                {
                  type: "setPlaybackRate",
                  params: ({ event }) => ({ playbackRate: event.playbackRate }),
                },
              ],
            },
            "video.setThumbnailUrl": {
              actions: [
                {
                  type: "setThumbnailUrl",
                  params: ({ event }) => ({ thumbnailUrl: event.thumbnailUrl }),
                },
              ],
            },
            "control.setCallback": {
              actions: [
                {
                  type: "setCallback",
                  params: ({ event }) => ({
                    callback: event.callback as keyof SinglePlayerListeners,
                    callbackFn: event.callbackFn as any,
                  }),
                },
              ],
            },
            "video.setProgressFrame": {
              actions: [
                {
                  type: "setProgressFrame",
                  params: ({ event }) => ({
                    progressFrame: event.progressFrame,
                  }),
                },
              ],
            },
            "video.unload": {
              target: ".Unload",
              actions: ["unloadVideo"],
            },
            "video.load": {
              target: ".Loading",
              actions: [
                {
                  type: "loadVideo",
                  params: ({ event }) => {
                    // console.log("loadVideo event", event.videoUrl);
                    return { videoUrl: event.videoUrl };
                  },
                },
              ],
            },
            "video.setMetadata": {
              actions: [
                {
                  type: "setMetadata",
                  params: ({ event }) => ({
                    width: event.width,
                    height: event.height,
                    durationInSeconds: event.durationInSeconds,
                    aspectRatio: event.aspectRatio,
                  }),
                },
              ],
            },
            "video.setCompositionExtraDurationFrames": {
              actions: [
                {
                  type: "setCompositionExtraDurationFrames",
                  params: ({ event }) => ({
                    compositionExtraDurationFrames:
                      event.compositionExtraDurationFrames,
                  }),
                },
              ],
            },
            "video.setCanPlay": {
              actions: [
                {
                  type: "setCanPlay",
                  params: ({ event }) => ({ canPlay: event.canPlay }),
                },
              ],
            },
          },
        },
        Format: {
          initial: "FauxScreen",
          id: "Format",
          states: {
            Regular: {
              entry: ["fauxScreenFalse"],
              on: {
                "display.fauxScreen": {
                  target: "FauxScreen",
                },
                "display.toggle": {
                  target: "FauxScreen",
                },
              },
            },
            FauxScreen: {
              entry: ["fauxScreenTrue"],
              on: {
                "display.inline": {
                  target: "Regular",
                },
                "display.toggle": {
                  target: "Regular",
                },
              },
            },
          },
        },
        Sound: {
          initial: "Unmuted",
          id: "Sound",
          states: {
            Unmuted: {
              entry: [{ type: "setMute", params: { muted: false } }],
              on: {
                "volume.unmute": {
                  target: "Unmuted",
                  reenter: true,
                },
                "volume.mute": {
                  target: "Muted",
                },
                "volume.toggleMute": [
                  {
                    guard: "isVideoElementMuted",
                    target: "Unmuted",
                    reenter: true,
                  },
                  {
                    target: "Muted",
                  },
                ],
              },
            },
            Muted: {
              entry: [{ type: "setMute", params: { muted: true } }],
              on: {
                "volume.unmute": {
                  target: "Unmuted",
                },
                "volume.toggleMute": [
                  {
                    target: "Unmuted",
                  },
                ],
              },
            },
          },
          on: {
            "volume.set": {
              target: "Sound",
              actions: [
                {
                  type: "setVolume",
                  params: ({ event }) => ({ volume: event.volume }),
                },
              ],
            },
          },
        },
      },

      type: "parallel",
    },
  },
});

// export const VideoPlayerMachineActor = createActor(VideoPlayerMachine, {
//
// });
// VideoPlayerMachineActor.start();
