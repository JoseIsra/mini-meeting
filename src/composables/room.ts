import { reactive } from 'vue';
import { JitsiConferenceRemake, Room } from '@/types';

export interface participantOnWait {
  id: string;
  name: string;
}

const roomState = reactive<Room>({} as Room);
const jitsiRoom = reactive<JitsiConferenceRemake>({} as JitsiConferenceRemake);

export function useRoom() {
  const setRoom = (room: Room) => {
    Object.assign(roomState, room);
  };

  const updateRoom = (value: Partial<Room>) => {
    Object.assign(roomState, { ...roomState, ...value });
  };

  const setRoomRestriction = (state: number) =>
    (roomState.roomRestriction = state);

  const setRoomMicState = (state: boolean) => (roomState.isMicBlocked = state);

  const setRoomCameraState = (state: boolean) =>
    (roomState.isCameraBlocked = state);

  const setRoomScreenShareState = (state: boolean) =>
    (roomState.isScreenShareBlocked = state);

  /* const updateFocus = (value: null | User) => (roomState.pinnedUser = value); */

  const updateBgUrl = (url: string) => (roomState.bgInfo.url = url);

  const updateBgSize = (maximized: boolean) =>
    (roomState.bgInfo.maximized = maximized);

  const updateAllowResetBg = (value: boolean) =>
    (roomState.bgInfo.allowResetBg = value);

  const setJitsiRoom = (value: JitsiConferenceRemake) => {
    Object.assign(jitsiRoom, value);
  };

  return {
    roomState,
    updateRoom,
    setRoom,
    setRoomRestriction,
    setRoomMicState,
    setRoomCameraState,
    setRoomScreenShareState,
    updateBgUrl,
    updateBgSize,
    updateAllowResetBg,
    setJitsiRoom,
    jitsiRoom,
  };
}
