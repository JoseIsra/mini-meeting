import { ref } from 'vue';

export interface Message {
  id: string;
  streamId: string;
  date: string;
  streamName: string;
  eventType: string;
  content: string | Blob;
  avatar: string;
  typeMessage: string;
  fileType?: string;
  fileName?: string;
}

const userMessages = ref<Message[]>([]);
const chatNotification = ref(false);
const amountOfNewMessages = ref(0);

export function useHandleMessage() {
  const setUserMessage = (value: Message) => {
    userMessages.value.push(value);
  };

  const deleteMessages = () => {
    userMessages.value = [];
  };

  const deleteLoadingMessage = (owner: string) => {
    const respectiveMessage = userMessages.value.findIndex(
      (message) => message.typeMessage == 'empty' && message.streamId == owner
    );
    userMessages.value.splice(respectiveMessage, 1);
  };

  const showChatNotification = (value: boolean) => {
    chatNotification.value = value;
  };

  const acumulateMessages = (value: number) => {
    amountOfNewMessages.value = value;
  };

  return {
    setUserMessage,
    userMessages,
    deleteMessages,
    deleteLoadingMessage,
    chatNotification,
    showChatNotification,
    amountOfNewMessages,
    acumulateMessages,
  };
}
