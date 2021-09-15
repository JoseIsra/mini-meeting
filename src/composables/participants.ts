import { ref } from 'vue';
import { Participant } from '@/types';

const participants = ref<Participant[]>([]);

export function useHandleParticipants() {
  const addParticipants = (value: Participant) => {
    // Object.assign(webRTCInstance, value);
    participants.value.push(value);
  };
  const deleteParticipantById = (id: string) => {
    const participantToDelete = participants.value.filter(
      (participant) => participant.id === id
    );
    participants.value.splice(
      participants.value.indexOf(participantToDelete[0]),
      1
    );
  };
  const deleteAllParticipants = () => {
    participants.value.splice(0, 1);
  };
  return {
    deleteAllParticipants,
    addParticipants,
    deleteParticipantById,
    participants,
  };
}
