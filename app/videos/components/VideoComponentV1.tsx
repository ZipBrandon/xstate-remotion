import { useSelector } from "@xstate/react";
import React, { memo, Ref, useCallback, useEffect } from "react";
import { VideoControls } from "~/videos/components/VideoControls.tsx";
import { useZipDealVideoRef } from "../VideoRefProvider.tsx";
import { useWatchedVideos } from "~/videos/WatchedVideoRadixProvider.tsx";
import { zipClsx } from "~/zipClsx.ts";
import { OutPortal } from "~/Portals.tsx";
import { useMeasure } from "@uidotdev/usehooks";
import { OnlyPlayer } from "~/videos/components/OnlyPlayer.tsx";

const Container = ({
  id = undefined,
  className = ``,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div id={id} className={className}>
    {children}
  </div>
);

interface VideoComponentProps {
  doAutoPlay?: boolean;
  headingElement?: React.ReactNode | null;
  forceFauxScreen?: boolean;
  inlinePlayer?: boolean;
  onClose?: () => void;
  videoIdentifier: string;
}

VideoControls.displayName = `VideoControls`;

export const VideoComponentV1 = memo(
  ({
    videoIdentifier,
    headingElement = null,
    forceFauxScreen = false,
    inlinePlayer = true,
    onClose = () => {},
  }: VideoComponentProps) => {
    const { portalNode, zipDealVideoRef, playerRef, videoPlayerMachineRef } =
      useZipDealVideoRef();

    const { isPlaying, setPlaying, setAutoPlay, isMuted, unmute } =
      useWatchedVideos()!;

    const currentProgress = useSelector(videoPlayerMachineRef, (snapshot) => {
      if (Number.isNaN(snapshot.context.videoProgress)) return 0;
      return snapshot.context.videoProgress;
    });

    const isProgressing = currentProgress > 0 && currentProgress < 100;

    const onPlayClick = useCallback(
      (e) => {
        setPlaying(!isPlaying);
      },

      [isPlaying, setPlaying]
    );

    // Idea here to have min controls with, otherwise it is becoming very narrow and inappropriate

    const PortalComponent = Container;
    const ModalComponent = Container;

    const displayPlayer = inlinePlayer || isProgressing;

    const durationInFrames = useSelector(
      videoPlayerMachineRef,
      (snapshot) => snapshot.context.videoDurationInFrames
    );

    useEffect(() => {
      setAutoPlay(true);
    }, [setAutoPlay]);

    const videoSizeWidth = 1280;
    const videoSizeHeight = 720;
    const isPlayingFauxScreen = false;
    const videoWidth = Math.floor(videoSizeWidth > 0 ? videoSizeWidth : 1280);
    const videoHeight = Math.floor(videoSizeHeight > 0 ? videoSizeHeight : 720); //videoWidth / videoAspectRatio;
    const [videoPlayerHousingRef, { width: videoHousingWidth }] =
      useMeasure<HTMLDivElement>();

    const [videoControlsRef, { height: controlButtonsHeight }] =
      useMeasure<HTMLDivElement>();

    const maxWidth1 = isPlayingFauxScreen ? videoWidth : undefined;

    return (
      <PortalComponent id={`portal-component`}>
        <ModalComponent
          id={`model-component`}
          className={zipClsx({
            [`flex max-h-[80vh] items-center break-words text-left`]:
              isPlayingFauxScreen,
            [`max-h-screen`]: isPlayingFauxScreen,
          })}
        >
          <div
            id={`video-component`}
            className={zipClsx({
              [`relative`]: true,
              [`zip-min-h-screen flex flex-col items-center justify-center`]:
                isPlayingFauxScreen,
            })}
          >
            <div
              ref={videoPlayerHousingRef as Ref<HTMLDivElement>}
              id={`video-player-housing-measurer`}
              className={zipClsx({
                " w-full": true,
              })}
            ></div>
            <div
              id={`video-player-housing-container`}
              style={{
                maxWidth: maxWidth1,
              }}
              className={zipClsx({
                [`relative flex w-full justify-center`]: true,
              })}
            >
              <div
                id={`video-player-housing`}
                className={zipClsx({
                  [`relative`]: true,
                  " w-full": true,
                })}
              >
                <div
                  id={`video-player`}
                  style={{ maxWidth: videoWidth }}
                  className={zipClsx({
                    "m-auto": true,
                  })}
                >
                  {displayPlayer && (
                    <div
                      id={`video-container`}
                      className={zipClsx({
                        "relative h-0 w-full overflow-hidden pb-[56.25%]": true,
                      })}
                    >
                      <OnlyPlayer
                        playerRef={playerRef}
                        durationInFrames={durationInFrames}
                        videoRef={zipDealVideoRef}
                        onClick={onPlayClick}
                        compositionHeight={videoHeight}
                        compositionWidth={videoWidth}
                      />
                      {isMuted && (
                        <div
                          onClick={(e) => {
                            unmute();
                          }}
                          className={`cursor-pointer w-full h-full absolute inset-0 text-stone-700/70`}
                        >
                          <svg
                            className={zipClsx(`w-full h-full`)}
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="32"
                              d="M416 432L64 80"
                            />
                            <path
                              className={zipClsx(`fill-current`)}
                              d="M224 136.92v33.8a4 4 0 0 0 1.17 2.82l24 24a4 4 0 0 0 6.83-2.82v-74.15a24.53 24.53 0 0 0-12.67-21.72a23.91 23.91 0 0 0-25.55 1.83a8.27 8.27 0 0 0-.66.51l-31.94 26.15a4 4 0 0 0-.29 5.92l17.05 17.06a4 4 0 0 0 5.37.26Zm0 238.16l-78.07-63.92a32 32 0 0 0-20.28-7.16H64v-96h50.72a4 4 0 0 0 2.82-6.83l-24-24a4 4 0 0 0-2.82-1.17H56a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h69.76l91.36 74.8a8.27 8.27 0 0 0 .66.51a23.93 23.93 0 0 0 25.85 1.69A24.49 24.49 0 0 0 256 391.45v-50.17a4 4 0 0 0-1.17-2.82l-24-24a4 4 0 0 0-6.83 2.82ZM352 256c0-24.56-5.81-47.88-17.75-71.27a16 16 0 0 0-28.5 14.54C315.34 218.06 320 236.62 320 256q0 4-.31 8.13a8 8 0 0 0 2.32 6.25l19.66 19.67a4 4 0 0 0 6.75-2A146.89 146.89 0 0 0 352 256m64 0c0-51.19-13.08-83.89-34.18-120.06a16 16 0 0 0-27.64 16.12C373.07 184.44 384 211.83 384 256c0 23.83-3.29 42.88-9.37 60.65a8 8 0 0 0 1.9 8.26l16.77 16.76a4 4 0 0 0 6.52-1.27C410.09 315.88 416 289.91 416 256"
                            />
                            <path
                              className={zipClsx(`fill-current`)}
                              d="M480 256c0-74.26-20.19-121.11-50.51-168.61a16 16 0 1 0-27 17.22C429.82 147.38 448 189.5 448 256c0 47.45-8.9 82.12-23.59 113a4 4 0 0 0 .77 4.55L443 391.39a4 4 0 0 0 6.4-1C470.88 348.22 480 307 480 256"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {displayPlayer && (
              <VideoControls
                videoControlsRef={videoControlsRef}
                contentWidth={videoWidth}
                videoIdentifier={videoIdentifier}
                forceFauxScreen={forceFauxScreen}
                onClose={onClose}
              />
            )}
          </div>
        </ModalComponent>
      </PortalComponent>
    );
  }
);

VideoComponentV1.displayName = `VideoComponentV1`;
