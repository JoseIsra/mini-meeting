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
  return {
    setUserMessage,
    userMessages,
    deleteMessages,
    deleteLoadingMessage,
  };
}
