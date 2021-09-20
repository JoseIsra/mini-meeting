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
  handleStopRecording?: (urlOfRecording: string) => void;
  handleMinimize?: (isMinimize: boolean) => void;

}

export interface ZoidWindow extends Window {
  xprops?: ZoidProps;
}
