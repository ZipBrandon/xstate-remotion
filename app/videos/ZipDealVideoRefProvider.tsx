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
import {
  ZipVideoCompositions,
  ZipVideoCompositionSettings,
} from "./compositions/VideoCompositionSettings.ts";
import { OnlyPlayer } from "./components/OnlyPlayer.tsx";
import { inspect } from "~/machineInspector";
import { VideoPlayerMachine } from "~/VideoPlayerMachine/machine";
import { VideoPlayerMachineType } from "~/VideoPlayerMachine/types";
import { createHtmlPortalNode, InPortal } from "~/Portals.tsx";

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

const ZipDealVideoRefProviderContext = createContext<
  | {
      portalNode: any;
      zipDealVideoRef: RefObject<HTMLVideoElement>;
      playerRef: RefObject<PlayerRef>;
      videoPlayerMachineRef: ActorRefFrom<VideoPlayerMachineType>;
      videoPlayerSend: ActorRefFrom<VideoPlayerMachineType>[`send`];
      activeComposition: keyof typeof ZipVideoCompositions;
      setActiveComposition: React.Dispatch<
        React.SetStateAction<keyof typeof ZipVideoCompositions>
      >;
    }
  | undefined
>(undefined);

const isSSR = typeof window === `undefined`;

export const portalNode = isSSR ? undefined : createHtmlPortalNode();

export const ZipDealVideoRefProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeComposition, setActiveComposition] =
    useState<keyof typeof ZipVideoCompositions>(`ZipVideoComposition`);
  const zipDealVideoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const videoPlayerMachineRef = useActorRef(VideoPlayerMachine.provide({}), {
    inspect,
    input: {
      videoElementRef: zipDealVideoRef,
      playerRef,
      autoPlay: true,
      compositionExtraDurationFrames: ZipVideoCompositionSettings.additional,
    },
  });

  const { send } = videoPlayerMachineRef;

  const context = useMemo(
    () => ({
      portalNode,
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
    <ZipDealVideoRefProviderContext.Provider value={context}>
      {children}
      {portalNode && (
        <InPortal node={portalNode}>
          <OnlyPlayer
            playerRef={playerRef}
            durationInFrames={10000}
            videoRef={zipDealVideoRef}
            onClick={function (e: any): void {
              throw new Error(`Function not implemented.`);
            }}
            compositionHeight={720}
            compositionWidth={1280}
            composition={activeComposition}
          ></OnlyPlayer>
          {/*<ZipVideo videoRef={zipDealVideoRef} />*/}
        </InPortal>
      )}
      {!portalNode && ( // SSR-mode to keep hydration proper
        // <ZipVideo videoRef={zipDealVideoRef} />
        <OnlyPlayer
          playerRef={playerRef}
          durationInFrames={10000}
          videoRef={zipDealVideoRef}
          onClick={function (e: any): void {
            throw new Error(`Function not implemented.`);
          }}
          compositionHeight={720}
          compositionWidth={1280}
          composition={`BasicComposition`}
        ></OnlyPlayer>
      )}
    </ZipDealVideoRefProviderContext.Provider>
  );
};

export const useZipDealVideoRef = () => {
  const context = useContext(ZipDealVideoRefProviderContext);
  if (context === undefined) {
    throw new Error(
      `useZipDealVideoRef must be used within a ZipDealVideoRefProvider`
    );
  }
  return context;
};
