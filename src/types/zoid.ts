import { lockAction } from './index';

interface ZoidProps {
  streamId?: string;
  roomId: string;
  streamName?: string;
  isCameraOn?: boolean;
  publishToken?: string;
  playToken?: string;
  photoURL?: string;
  roleId?: number;
  sharedLink?: string;
  isMicLocked?: boolean;
  isCameraLocked?: boolean;
  isScreenShareLocked?: boolean;
  handleLeaveCall?: (arg: number) => void;
  handleEndCall?: () => void;
  handleStopRecording?: (urlOfRecording: string) => void;
  toggleMinimize?: (isMinimize: boolean) => void;
  toggleLockAction?: (lockAction: lockAction) => void;
}

export interface ZoidWindow extends Window {
  xprops?: ZoidProps;
}
