import type { MetaFunction } from "@remix-run/node";
import { VideoComponentV1 } from "~/videos/components/VideoComponentV1.tsx";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <VideoComponentV1 headingElement={null} videoIdentifier={"something"} />
    </div>
  );
}
