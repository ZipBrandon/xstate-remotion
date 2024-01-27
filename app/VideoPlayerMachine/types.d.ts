import { PlayerRef } from "@remotion/player";
import { RefObject } from "react";
import { VideoPlayerMachine } from "~/VideoPlayerMachine/machine.tsx";

export type VideoPlayerMachineType = typeof VideoPlayerMachine;
type SeekPayload = {
  frame: number;
};
type ErrorPayload = {
  error: Error;
};
type TimeUpdateEventPayload = {
  frame: number;
};
type FrameUpdateEventPayload = {
  frame: number;
};
type RateChangeEventPayload = {
  playbackRate: number;
};
type ScaleChangeEventPayload = {
  scale: number;
};
type VolumeChangeEventPayload = {
  volume: number;
};
type FullscreenChangeEventPayload = {
  isFullscreen: boolean;
};
type MuteChangeEventPayload = {
  isMuted: boolean;
};
export type PlayerStateEventMap = {
  seeked: SeekPayload;
  pause: undefined;
  play: undefined;
  ratechange: RateChangeEventPayload;
  scalechange: ScaleChangeEventPayload;
  volumechange: VolumeChangeEventPayload;
  ended: undefined;
  error: ErrorPayload;
  timeupdate: TimeUpdateEventPayload;
  frameupdate: FrameUpdateEventPayload;
  fullscreenchange: FullscreenChangeEventPayload;
  mutechange: MuteChangeEventPayload;
};
export type PlayerEventTypes = keyof PlayerStateEventMap;
export type ThumbnailEventTypes = keyof ThumbnailStateEventMap;
export type CallbackListener<T extends PlayerEventTypes> = (data: {
  detail: PlayerStateEventMap[T];
}) => void;
export type SinglePlayerListeners = {
  [EventType in PlayerEventTypes]: CallbackListener<EventType>;
};
export type SingleThumbnailListeners = {
  [EventType in ThumbnailEventTypes]: CallbackListener<EventType>;
};

export interface VideoPlayerMachineContext {
  videoElementRef: RefObject<HTMLVideoElement>;
  playerRef: RefObject<PlayerRef>;
  volume: number;
  videoUrl: string;
  thumbnailUrl: string;
  autoPlay: boolean;
  canPlay: boolean;
  fauxScreen: boolean;
  isVideoEnded: boolean;
  isMobile: boolean;
  callbacks: SinglePlayerListeners;
  playbackRate: number;
  secondsLoaded: number;
  currentTime: number;
  videoProgress: number;
  videoDurationInFrames: number;
  compositionDurationInFrames: number;
  compositionExtraDurationFrames: number;
  fps: number;
  width: number;
  height: number;
  aspectRatio: number;
  videoDurationInSeconds: number;
  currentFrame: number;
}

type OptionalKeysOfVideoPlayerMachineInput =
  | "volume"
  | "videoUrl"
  | "thumbnailUrl"
  | "autoPlay"
  | "fauxScreen"
  | "isMobile"
  | "isVideoEnded"
  | "callbacks"
  | "playbackRate"
  | "compositionExtraDurationFrames";

export type VideoPlayerMachineInput = Pick<
  VideoPlayerMachineContext,
  "videoElementRef" | "playerRef"
> &
  Partial<
    Pick<VideoPlayerMachineContext, OptionalKeysOfVideoPlayerMachineInput>
  >;
export type VideoPlayerMachineEvents =
  | { type: "Stop" }
  | { type: "control.rewind"; seconds: number }
  | { type: "display.inline" }
  | { type: "display.fauxScreen" }
  | { type: "display.toggle" }
  | { type: "volume.unmute" }
  | { type: "volume.mute" }
  | { type: "volume.toggleMute" }
  | { type: "viewer.viewed" }
  | { type: "viewer.reset" }
  | { type: "volume.set"; volume: number }
  | { type: "video.toggle"; event?: Event }
  | { type: "video.play"; event?: Event }
  | { type: "video.load"; videoUrl: string }
  | { type: "video.unload" }
  | { type: "video.pause"; event?: Event }
  | { type: "video.setPlaybackRate"; playbackRate: number }
  | { type: "video.finish" }
  | { type: "video.replay"; event?: Event }
  | {
      progressFrame: number;
      type: "video.setProgressFrame";
    }
  | { type: "video.setThumbnailUrl"; thumbnailUrl: string }
  | { type: "video.setCanPlay"; canPlay: boolean }
  | {
      type: "video.setMetadata";
      width: number;
      height: number;
      durationInSeconds: number;
      aspectRatio: number;
    }
  | {
      type: "video.setCompositionExtraDurationFrames";
      compositionExtraDurationFrames: number;
    }
  | { type: "set.secondsLoaded" }
  | { type: "autoplay.set"; autoPlay: boolean }
  | {
      type: "control.setCallback";
      callback: PlayerEventTypes;
      callbackFn: SinglePlayerListeners;
    }
  | { type: "control.setPlaybackRate"; playbackRate: number }
  | { type: "control.seekToSeconds"; seconds: number }
  | { type: "control.seekToFrame"; frame: number }
  | { type: "control.seekRelativeSeconds"; secondsOffset: number }
  | { type: "control.seekToPercent"; percent: number };
