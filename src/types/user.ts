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
  isRecording: boolean;
  roleId: number;
  isHost: boolean;
  isPublishing: number; // 0 -> off / 1 -> on / 2 -> loading . For my own user
  cameraPublishedState?: ComputedRef; // For my own user
  micPublishedState?: ComputedRef; //  For my own user
  screenSharingPublishedState?: ComputedRef; // For my own user
  hasLogJoin?: boolean; // Specially for others users because mine just log one time
  cameraId?: string;
  micId?: string;
}
