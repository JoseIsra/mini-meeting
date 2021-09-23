import { AsyncComponent, Component } from "vue";
import { VueConstructor } from "vue/types/umd";
import * as zoid from "zoid/dist/zoid.frameworks";

interface zoidAttributes {
  iframe: Record<string, string>;
}

interface zoidOptions {
  tag: string;
  url: string;
  dimensions: Record<string, string>;
  attributes: zoidAttributes;
  props: unknown;
}

interface zoidType {
  create: (options: zoidOptions) => zoidCreated;
}

interface zoidCreated {
  driver: (
    framework: string,
    Vue: VueConstructor<Vue>
  ) =>
    | Component<unknown, unknown, unknown, unknown>
    | AsyncComponent<unknown, unknown, unknown, unknown>;
}

const FractalUpCooperate: zoidCreated = (zoid as zoidType).create({
  tag: "fractalup-cooperate",
  url: "https://localhost:8080",
  dimensions: {
    width: "1200px",
    height: "600px",
  },
  attributes: {
    iframe: {
      scrolling: "no",
      allow: "camera *; microphone *; display-capture *",
      allowFullScreen: "true",
    },
  },
  props: {
    roomId: {
      type: "string",
      required: false,
    },
    streamId: {
      type: "string",
      required: true,
    },
    streamName: {
      type: "string",
      required: false,
    },
    handleLeaveCall: {
      type: "function",
      required: false,
    },
    handleEndCall: {
      type: "function",
      required: false,
    },
    handleStopRecording: {
      type: "function",
      required: false,
    },
    toggleMinimize: {
      type: "function",
      required: false,
    },
    toggleLockAction: {
      type: "function",
      required: false,
    },
    sharedLink: {
      type: "string",
      required: false,
    },
    classroomId: {
      type: "string",
      required: false,
    },
    isCameraLocked: {
      type: "boolean",
      required: false,
    },
    isScreenShareLocked: {
      type: "boolean",
      required: false,
    },
    isMicLocked: {
      type: "boolean",
      required: false,
    },
    photoURL: {
      type: "string",
      required: false,
    },
  },
});

export default FractalUpCooperate;
