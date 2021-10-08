import { lockAction } from './index';

export interface ZoidProps {
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
  classroomId?: string;
  isMicOn?: boolean;
  isBeingRecorded?: boolean;
  privacy?: boolean;
  handleLeaveCall?: (
    arg: number,
    remainingParticipantsFractalUserIds?: string[]
  ) => void;
  handleStopRecording?: (urlOfRecording: string) => void;
  toggleMinimize?: (isMinimize: boolean) => void;
  toggleLockAction?: (lockAction: lockAction) => void;
  fractalUserId?: string;
  logJoined?: () => void;
  handleStartRecording?: () => void;
}
