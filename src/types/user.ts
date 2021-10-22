import { ComputedRef } from 'vue';

export interface User {
  id: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isVideoActivated: boolean;
  isMicBlocked: boolean;
  isCameraBlocked: boolean;
  isScreenShareBlocked: boolean;
  fractalUserId: string;
  denied: number;
  existVideo?: boolean;
  urlOfVideo?: string;
  videoInstance?: HTMLMediaElement & { playerId: string };
  currentTime?: number;
  isPlayingVideo?: boolean;
  isRecording: boolean;
  roleId: number;
  isBeingPlayed?: boolean; //For other participants
  isHost?: boolean;
  isPublishing?: number; // 0 -> off / 1 -> on / 2 -> loading . For my own user
  cameraPublishedState?: ComputedRef; // For my own user
  micPublishedState?: ComputedRef; //  For my own user
  hasLogJoin?: boolean; // Specially for others users because mine just log one time
}

export interface UpdatedUserfields {
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
  isBeingPlayed?: boolean; //For other participants
  isHost?: boolean;
  isPublishing?: number; // 0 -> off / 1 -> on / 2 -> loading . For my own user
  cameraPublishedState?: ComputedRef; // For my own user
  micPublishedState?: ComputedRef; //  For my own user
  hasLogJoin?: boolean; // Specially for others users because mine just log one time
}
