import * as zoid from "zoid/dist/zoid.frameworks";
import Vue from "vue";

const FractalUpCooperate = zoid.create({
  tag: "fractalup-cooperate",
  url: "https://localhost:8081",
  dimensions: {
    width: "100%",
    height: "100%",
  },
  attributes: {
    iframe: {
      scrolling: "no",
      allow: "camera *; microphone *; display-capture *;",
      allowFullScreen: "true",
      allowusermedia: "true",
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

const FractalUpCooperateInstance = FractalUpCooperate.driver("vue", Vue);

export default FractalUpCooperateInstance;
