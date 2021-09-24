export interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
  photoURL?: string;
  fractalUserId?: string;
  handleLeaveCall?: (arg: number) => void;
  sharedLink?: string;
  handleEndCall?: () => Promise<void>;
  handleStopRecording?: (urlOfRecording: string) => void;
  toggleMinimize?: (isMinimize: boolean) => void;
  logJoined?: () => void;
}
