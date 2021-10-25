export interface Participant {
  id?: string;
  name?: string;
  avatar?: string;
  stream?: MediaStream;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  isScreenSharing?: boolean;
  isVideoActivated?: boolean;
  isMicBlocked?: boolean;
  isCameraBlocked?: boolean;
  isScreenShareBlocked?: boolean;
  fractalUserId?: string;
  denied?: number;
  isRecording?: boolean;
  roleId?: number;
  isBeingPlayed?: boolean;
  hasLogJoin?: boolean;
}
