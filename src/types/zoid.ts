interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
  photoURL?: string;
  handleLeaveCall?: () => void;
  handleEndCall?: () => void;
  handleEndRecording?: (urlOfRecording: string) => void;
}

export interface ZoidWindow extends Window {
  xprops?: ZoidProps;
}
