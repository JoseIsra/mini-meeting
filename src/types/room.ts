import { BgInfo } from '@/types/zoid';

export interface Room {
  id: string;
  isBeingRecorded?: boolean;
  recordingUrl: string;
  sharingLink?: string;
  classroomId: string;
  isMicBlocked: boolean;
  isCameraBlocked: boolean;
  isScreenShareBlocked: boolean;
  roomRestriction: number;
  startDate: string;
  bgInfo: BgInfo;
  hostId: string;
  fbTransmission?: boolean;
  ytTransmission?: boolean;
  rtmpTransmission?: boolean;
}
