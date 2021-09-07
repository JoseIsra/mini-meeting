interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
  photoURL?: string;
  handleEndCall?: () => void;
}

export interface ZoidWindow extends Window {
  xprops?: ZoidProps;
}
