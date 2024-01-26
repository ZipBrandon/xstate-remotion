import { createBrowserInspector } from "@statelyai/inspect";

const inspector = () => {
  if (typeof window !== "undefined") {
    console.log("loca", window.location.hostname.indexOf("zd-local") > -1);
    if (window.location.hostname.indexOf("zd-local") > -1) return createBrowserInspector();
  }
  return { inspect: undefined };
};

export const { inspect } = inspector();
