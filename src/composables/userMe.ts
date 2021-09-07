import { reactive } from 'vue';

// interface User {
//   id: string;
//   name: string;
//   avatar: string;
// }

const userState = {
  id: '1',
  name: 'Fractal',
  avatar: 'https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg',
};

const me = reactive(userState);
export function useUser() {
  return {
    me,
  };
}
