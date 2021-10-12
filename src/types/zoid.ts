import { User } from '@/composables/userMe';
import { lockAction } from './index';

interface B2Info {
  uploadUrl: string;
  authorizationToken: string;
}

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
  roomRestriction?: boolean;
  isHost?: boolean;
  focused?: User;
  startDate?: string;
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
  getB2Info?: () => Promise<B2Info>;
  addUserLogToState?: (fractalUserId: string, logType: number) => void;
}
