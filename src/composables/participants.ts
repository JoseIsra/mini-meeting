import { ref } from 'vue';
import { Participant } from '@/types';

const participants = ref<Participant[]>([]);

export function useHandleParticipants() {
  const addParticipants = (value: Participant) => {
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

  const setParticipantActions = (
    participant: Participant,
    action: number,
    value: boolean
  ) => {
    participants.value = participants.value.map((part) => {
      if (part.id === participant.id) {
        if (action === 0) {
          return {
            ...part,
            isMicBlocked: value,
            isVideoBlocked: value,
            isScreenShareBlocked: value,
          };
        } else {
          return {
            ...part,
            isMicBlocked: action === 1 ? value : part.isMicBlocked,
            isVideoBlocked: action === 2 ? value : part.isVideoBlocked,
            isScreenShareBlocked:
              action === 3 ? value : part.isScreenShareBlocked,
          };
        }
      }
      return participant;
    });
  };

  const setEveryParticipantActions = (action: number, value: boolean) => {
    participants.value = participants.value.map((part) => {
      if (action === 0) {
        return {
          ...part,
          isMicBlocked: value,
          isVideoBlocked: value,
          isScreenShareBlocked: value,
        };
      } else {
        return {
          ...part,
          isMicBlocked: action === 1 ? value : part.isMicBlocked,
          isVideoBlocked: action === 2 ? value : part.isVideoBlocked,
          isScreenShareBlocked:
            action === 3 ? value : part.isScreenShareBlocked,
        };
      }
    });
  };

  return {
    deleteAllParticipants,
    addParticipants,
    deleteParticipantById,
    participants,
    setParticipantActions,
    setEveryParticipantActions,
  };
}
