import { reactive } from 'vue';

import { User } from '@/composables/userMe';
import { bgInfo } from '@/types/zoid';

export interface Room {
  id: string;
  isBeingRecorded?: boolean;
  sharingLink?: string;
  classroomId: string;
  isMicBlocked: boolean;
  isCameraBlocked: boolean;
  isScreenShareBlocked: boolean;
  privacy: boolean;
  // bgUrl?: string;
  // bgMaximixed: boolean;
  startDate: string;
  pinnedUser: null | User;
  pinnedUserId?: string;
  bgInfo: bgInfo;
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
  const setRecorded = (state: boolean) => {
    Object.assign(roomState, { ...roomState, isBeingRecorded: state });
  };

  const setPrivacy = (state: boolean) => (roomState.privacy = state);

  const setRoomMicState = (state: boolean) => (roomState.isMicBlocked = state);

  const setRoomCameraState = (state: boolean) =>
    (roomState.isCameraBlocked = state);

  const setRoomScreenShareState = (state: boolean) =>
    (roomState.isScreenShareBlocked = state);

  const updateFocus = (value: null | User) => (roomState.pinnedUser = value);

  const updateBgUrl = (url: string) => (roomState.bgInfo.url = url);

  const updateBgSize = (maximized: boolean) => roomState.bgInfo.maximized = maximized;

  return {
    roomState,
    setRoom,
    setRecorded,
    setPrivacy,
    setRoomMicState,
    setRoomCameraState,
    setRoomScreenShareState,
    updateFocus,
    updateBgUrl,
    updateBgSize
  };
}
