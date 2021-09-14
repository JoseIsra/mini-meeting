import { reactive } from 'vue';
import { Participant } from '@/types';

const participants = reactive<Participant[]>([]);

export function useHandleParticipants() {
  const addParticipant = (value: Participant) => {
    participants.push(value);
  };
  const setParticipants = (value: Participant[]) => {
    Object.assign({}, participants, value);
  };
  const deleteParticipantById = (id: string) => {
    //participants.filter(participant => participant.id === id);
    /* _.remove(participants, (participant) => {
      participant.id === id;
    }); */
    participants.splice(participants.indexOf({ id }));

    console.log(participants, '⭐⭐');
  };

  return {
    participants,
    addParticipant,
    setParticipants,
    deleteParticipantById,
  };
}
