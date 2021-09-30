import { reactive } from 'vue';

export interface Room {
  id: string;
  isBeingRecorded?: boolean;
  sharingLink?: string;
  classroomId: string;
  privacy: boolean;
  waitList: Array<participantOnWait>;
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

  const newParticipantOnWait = (participant: participantOnWait) =>
    roomState.waitList.push(participant);

  const removeParticipantOnWait = (participant: participantOnWait) =>
    (roomState.waitList = roomState.waitList.filter(
      (p) => p.id !== participant.id
    ));

  return {
    roomState,
    setRoom,
    setRecorded,
    setPrivacy,
    newParticipantOnWait,
    removeParticipantOnWait,
  };
}
