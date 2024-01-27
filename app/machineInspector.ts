import { createBrowserInspector } from "@statelyai/inspect";

const inspector = () => {
  if (typeof window !== "undefined") {
    return createBrowserInspector();
  }
  return { inspect: undefined };
};

export const { inspect } = inspector();
