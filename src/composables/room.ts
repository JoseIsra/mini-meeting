import { reactive } from 'vue';

import { User } from '@/types/user';

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
  roomRestriction: boolean;
  // bgUrl?: string;
  // bgMaximixed: boolean;
  startDate: string;
  pinnedUser: null | User;
  pinnedUserId?: string;
  bgInfo: BgInfo;
  hostId: string;
  fbTransmission?: boolean;
  ytTransmission?: boolean;
  rtmpTransmission?: boolean;
}

export interface UpdatedRoomFields {
  id?: string;
  isBeingRecorded?: boolean;
  recordingUrl?: string;
  sharingLink?: string;
  classroomId?: string;
  isMicBlocked?: boolean;
  isCameraBlocked?: boolean;
  isScreenShareBlocked?: boolean;
  roomRestriction?: boolean;
  // bgUrl?: string;
  // bgMaximixed: boolean;
  startDate?: string;
  pinnedUser?: null | User;
  pinnedUserId?: string;
  bgInfo?: BgInfo;
  hostId?: string;
  fbTransmission?: boolean;
  ytTransmission?: boolean;
  rtmpTransmission?: boolean;
}

export interface participantOnWait {
  id: string;
  name: string;
}

const roomState = reactive<Room>({} as Room);

export function useRoom() {
  const setRoom = (room: Room) => {
    Object.assign(roomState, room);
  };

  const updateRoom = (value: UpdatedRoomFields) => {
    console.log('changing room', '🚀🚀🚀');
    Object.assign(roomState, { ...roomState, ...value });
  };

  const setRoomRestriction = (state: boolean) =>
    (roomState.roomRestriction = state);

  const setRoomMicState = (state: boolean) => (roomState.isMicBlocked = state);

  const setRoomCameraState = (state: boolean) =>
    (roomState.isCameraBlocked = state);

  const setRoomScreenShareState = (state: boolean) =>
    (roomState.isScreenShareBlocked = state);

  const updateFocus = (value: null | User) => (roomState.pinnedUser = value);

  const updateBgUrl = (url: string) => (roomState.bgInfo.url = url);

  const updateBgSize = (maximized: boolean) =>
    (roomState.bgInfo.maximized = maximized);

  const updateAllowResetBg = (value: boolean) =>
    (roomState.bgInfo.allowResetBg = value);

  return {
    roomState,
    updateRoom,
    setRoom,
    setRoomRestriction,
    setRoomMicState,
    setRoomCameraState,
    setRoomScreenShareState,
    updateFocus,
    updateBgUrl,
    updateBgSize,
    updateAllowResetBg,
  };
}
