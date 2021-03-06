import JitsiTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiTrack';
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
  speakerId?: string;
  cameraId?: string;
  micId?: string;
  canDraw: boolean;
  hasWebcam?: boolean;
  hasMic?: boolean;
  isVideoOwner?: boolean;
  tracks?: JitsiTrack[];
}
