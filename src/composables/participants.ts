import { ref } from 'vue';
import { Participant } from '@/types';

const participants = ref<Participant[]>([]);

export function useHandleParticipants() {
  const addParticipants = (value: Participant) => {
    // Object.assign(webRTCInstance, value);
    participants.value.push(value);
  };
  return {
    addParticipants,
    participants,
  };
}
