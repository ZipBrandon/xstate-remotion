import React from "react";
import { useCurrentVideoProgress } from "~/videos/WatchedVideoRadixProvider.tsx";
import { zipClsx } from "~/zipClsx.ts";

export const VideoProgressIndicator = React.memo(
  ({ contentWidth }: { contentWidth: number | "NaN" }) => {
    const { currentProgress } = useCurrentVideoProgress();

    const _contentWidth =
      !Number.isNaN(contentWidth) && contentWidth !== `NaN` && contentWidth >= 0
        ? contentWidth
        : 0;

    const _currentProgress =
      !Number.isNaN(currentProgress) && currentProgress >= 0
        ? currentProgress
        : 0;

    return (
      <div
        style={{
          width: _contentWidth,
        }}
        className={zipClsx({
          [`relative m-auto`]: true,
        })}
      >
        <div
          className={zipClsx({
            [`h-2 w-full bg-gray-400`]: true,
          })}
        />
        <div
          style={{ width: _contentWidth * _currentProgress }}
          className={zipClsx({
            [`h-2 bg-blue-500 absolute left-0 top-0`]: true,
          })}
        ></div>
      </div>
    );
  }
);
VideoProgressIndicator.displayName = `VideoProgressIndicator`;
