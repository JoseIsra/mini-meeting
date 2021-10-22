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
  existVideo?: boolean;
  urlOfVideo?: string;
  videoInstance?: HTMLMediaElement & { playerId: string };
  currentTime?: number;
  isPlayingVideo?: boolean;
  isRecording?: boolean;
  roleId?: number;
  isBeingPlayed?: boolean;
  hasLogJoin?: boolean;
}
