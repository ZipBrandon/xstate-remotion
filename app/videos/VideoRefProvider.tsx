import { PlayerRef } from "@remotion/player";

import { useActorRef } from "@xstate/react";
import React, {
  createContext,
  RefObject,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActorRefFrom } from "xstate";
import { inspect } from "~/machineInspector";
import { VideoPlayerMachine } from "~/VideoPlayerMachine/machine";
import { VideoPlayerMachineType } from "~/VideoPlayerMachine/types";
import { VideoCompositions } from "~/videos/compositions/VideoCompositionSettings.ts";

export const defaultStyles: React.CSSProperties = {
  display: `flex`,
  flex: 1,
  justifyContent: `center`,
  alignItems: `center`,
  fontFamily: `--apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
  fontWeight: `bold`,
  fontSize: 100,
  lineHeight: 1.1,
};

const VideoRefProviderContext = createContext<
  | {
      portalNode: any;
      zipDealVideoRef: RefObject<HTMLVideoElement>;
      playerRef: RefObject<PlayerRef>;
      videoPlayerMachineRef: ActorRefFrom<VideoPlayerMachineType>;
      videoPlayerSend: ActorRefFrom<VideoPlayerMachineType>[`send`];
      activeComposition: keyof typeof VideoCompositions;
      setActiveComposition: React.Dispatch<
        React.SetStateAction<keyof typeof VideoCompositions>
      >;
    }
  | undefined
>(undefined);

export const VideoRefProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeComposition, setActiveComposition] =
    useState<keyof typeof VideoCompositions>(`VideoComposition`);
  const zipDealVideoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const videoPlayerMachineRef = useActorRef(VideoPlayerMachine.provide({}), {
    inspect,
    input: {
      videoElementRef: zipDealVideoRef,
      playerRef,
      autoPlay: true,
      compositionExtraDurationFrames: 0,
    },
  });

  const { send } = videoPlayerMachineRef;

  const context = useMemo(
    () => ({
      zipDealVideoRef,
      videoPlayerMachineRef,
      videoPlayerSend: send,
      playerRef,
      setActiveComposition,
      activeComposition,
    }),
    [activeComposition, send, videoPlayerMachineRef]
  );

  return (
    <VideoRefProviderContext.Provider value={context}>
      {children}
    </VideoRefProviderContext.Provider>
  );
};

export const useZipDealVideoRef = () => {
  const context = useContext(VideoRefProviderContext);
  if (context === undefined) {
    throw new Error(
      `useZipDealVideoRef must be used within a ZipDealVideoRefProvider`
    );
  }
  return context;
};
