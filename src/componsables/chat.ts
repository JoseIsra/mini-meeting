import { reactive } from 'vue';

interface Prueba {
  streamId: string;
  streamName: string;
  eventType: string;
  message: string;
}
// const messages = {
//   message: '',
// };

const userMessage = reactive({} as Prueba);

export function useHandleMessage() {
  const setUserMessage = (value: Prueba) => {
    Object.assign(userMessage, value);
  };

  return {
    setUserMessage,
    userMessage,
  };
}
