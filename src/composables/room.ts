import { reactive } from 'vue';

export interface Room {
  id: string;
}

const roomState = reactive<Room>({} as Room);

export function useRoom() {
  const setRoom = (room: Room) => {
    Object.assign(roomState, room);
  };

  return {
    roomState,
    setRoom,
  };
}
