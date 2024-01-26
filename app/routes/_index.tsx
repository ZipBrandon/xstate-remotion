import type { MetaFunction } from "@remix-run/node";
import useVideoPlayer from "~/videos/useVideoPlayer.tsx";
import { VideoComponentV1 } from "~/videos/components/VideoComponentV1.tsx";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { isPlaying, getCurrentTime, setPlaying } = useVideoPlayer({
    autoPlay: true,
    videoUrl:
      "https://zipdeal.s3.amazonaws.com/m/globalvideo/processed_video/9a830cbb-1236-4494-aa83-1277f2d3a35b.mp4",
    pageId: "something",
    volume: 1,
    videoThumbnail: undefined,
    extra: undefined,
  });
  return (
    <div>
      <VideoComponentV1 headingElement={null} videoIdentifier={"something"} />
    </div>
  );
}
