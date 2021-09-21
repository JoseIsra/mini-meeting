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

  const lockParticipantActions = (value: Participant) => {
    participants.value = participants.value.map((participant) => {
      if (participant.id === value.id) {
        return {
          ...participant,
          isMicBlocked: true,
          isVideoBlocked: true,
          isScreenShareBlocked: true,
        };
      }
      return participant;
    });
  };

  const unlockParticipantActions = (value: Participant) => {
    participants.value = participants.value.map((participant) => {
      if (participant.id === value.id) {
        return {
          ...participant,
          isMicBlocked: false,
          isVideoBlocked: false,
          isScreenShareBlocked: false,
        };
      }
      return participant;
    });
  };

  const lockEveryParticipantActions = () => {
    participants.value = participants.value.map((participant) => {
      return {
        ...participant,
        isMicBlocked: true,
        isVideoBlocked: true,
        isScreenShareBlocked: true,
      };
    });
  };

  const unlockEveryParticipantActions = () => {
    participants.value = participants.value.map((participant) => {
      return {
        ...participant,
        isMicBlocked: false,
        isVideoBlocked: false,
        isScreenShareBlocked: false,
      };
    });
  };

  return {
    deleteAllParticipants,
    addParticipants,
    deleteParticipantById,
    participants,
    lockParticipantActions,
    unlockParticipantActions,
    lockEveryParticipantActions,
    unlockEveryParticipantActions,
  };
}
