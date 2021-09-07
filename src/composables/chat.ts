import { ref } from 'vue';

export interface Message {
  id: string;
  streamId: string;
  date: string;
  streamName: string;
  eventType: string;
  message: string;
}
// const messages = {
//   message: '',
// };

const userMessages = ref<Message[]>([]);

export function useHandleMessage() {
  const setUserMessage = (value: Message) => {
    userMessages.value.push(value);
  };

  return {
    setUserMessage,
    userMessages,
  };
}
