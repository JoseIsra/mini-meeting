interface SoundGainType {
  gain: {
    value: number;
  };
}

export interface objWebRTC {
  ATTR_ROOM_NAME: string;
  command: string;
  definition: string;
  room: string;
  streamId: string;
  streams: string[];
  stream: MediaStream;
  event: Record<string, string>;
  data: string;
}

export interface Icons {
  id: string;
  onState: string;
  offState: string;
  active: boolean;
  toolTipMessage: string;
  toolTipSecondMessage?: string;
  ubication?: string;
  interaction?: string;
}
export const regexp = /^(?!\s*$).+/;

export interface WebRTCAdaptorType {
  joinRoom?: (roomName: string, streamId: string, mode: string) => void;
  leaveFromRoom?: (roomName: string) => void;
  getRoomInfo?: (roomName: string, publishStreamId: string) => void;
  publish?: (
    streamId: string,
    token?: string,
    subscriberId?: string,
    subscriberCode?: string,
    streamName?: string
  ) => void;
  play?: (
    streamId: string,
    token: string,
    roomId: string,
    subscriberId?: string,
    susbscriberCode?: string
  ) => void;
  turnOffLocalCamera?: (streamId: string) => void;
  justTurnOnLocalCamera?: (streamId: string) => void;
  turnOnLocalCamera?: (streamId: string) => void;
  sendData?: (publishStreamId: string, notEvent: string) => void;
  switchDesktopCapture?: (publishStreamId: string) => void;
  switchVideoCameraCapture?: (
    publishStreamId: string,
    deviceId: string
  ) => void;
  switchDesktopCaptureWithCamera?: (publishStreamId: string) => void;
  muteLocalMic?: () => void;
  unmuteLocalMic?: () => void;
  currentVolume?: number;
  soundOriginGainNode?: SoundGainType;
  secondStreamGainNode?: SoundGainType;
  switchVideoSource?: (
    streamId: string,
    mediaConstraints: Record<string, string>,
    onEndedCallback: () => void
  ) => void;
  resetDesktop?: () => void;
}

export interface dataType {
  streamId: string;
  message?: string;
  type: string;
}

export interface Periferics {
  WEBCAM: () => void;
  MIC: () => void;
}

export interface Functionalities {
  CHAT: () => void;
  HANDUP?: () => void;
  SHARESCREEN: () => void;
  SHARENOTES?: () => void;
  USERLIST?: () => void;
  CONNECTION?: () => void;
}
