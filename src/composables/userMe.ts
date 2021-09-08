import { reactive } from 'vue';

export interface User {
  id: string;
  name: string;
  avatar: string;
}

const userState = {} as User;
const pinnedStream = {} as MediaStream;

const userMe = reactive(userState);
const pinnedUserStream = reactive(pinnedStream);

export function useUserMe() {
  const setUserMe = (value: User) => {
    Object.assign(userState, value);
  };

  const setPinnedUser = (value: MediaStream) => {
    Object.assign(pinnedUserStream, value);
  };

  return {
    userMe,
    setUserMe,
    setPinnedUser,
    pinnedUserStream,
  };
}
