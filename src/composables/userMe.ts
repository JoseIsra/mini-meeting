import { reactive } from 'vue';

interface User {
  id: string;
  name: string;
  avatar: string;
}

const userState = {} as User;

const userMe = reactive(userState);
export function useUserMe() {
  const setUserMe = (value: User) => {
    Object.assign(userState, value);
  };

  return {
    userMe,
    setUserMe,
  };
}
