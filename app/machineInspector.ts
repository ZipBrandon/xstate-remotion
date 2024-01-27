import { createBrowserInspector } from "@statelyai/inspect";

const inspector = () => {
  if (typeof window !== "undefined") {
    /// Returning this will enable the inspector in the browser
    // return createBrowserInspector();
  }
  return { inspect: undefined };
};

export const { inspect } = inspector();
