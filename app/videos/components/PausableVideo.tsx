import React, {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { RemotionMainVideoProps, RemotionVideoProps, Video } from "remotion";
import { BufferContext } from "./BufferManager.tsx";

const PausableVideoFunction: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  RemotionVideoProps & RemotionMainVideoProps
> = ({ src, ...props }, ref) => {
  const pausableVideoRef = useRef<HTMLVideoElement>(null);

  const id = useId();

  useImperativeHandle(ref, () => pausableVideoRef.current as HTMLVideoElement);

  const { canPlay, needsToBuffer } = useContext(BufferContext);

  useEffect(() => {
    const { current } = pausableVideoRef;
    if (!current) {
      return;
    }

    const onPlay = () => {
      canPlay(id);
    };

    const onBuffer = () => {
      needsToBuffer(id);
    };

    current.addEventListener(`canplay`, onPlay);
    current.addEventListener(`waiting`, onBuffer);

    return () => {
      current.removeEventListener(`canplay`, onPlay);
      current.removeEventListener(`waiting`, onBuffer);

      // If component is unmounted, unblock the buffer manager
      canPlay(id);
    };
  }, [canPlay, id, needsToBuffer]);

  return <Video {...props} ref={pausableVideoRef} src={src} />;
};

export const PausableVideo = forwardRef(PausableVideoFunction);
