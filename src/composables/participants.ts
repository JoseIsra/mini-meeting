import { ref, computed } from 'vue';
import { Participant } from '@/types';
import { LOCK_ACTION_TYPE, PERMISSION_STATUS } from '@/utils/enums';

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
    participantId: string,
    action: number,
    value: boolean
  ) => {
    const participantToModify = participants.value.filter(
      (currentParticipant) => currentParticipant.id === participantId
    )[0];

    if (action === LOCK_ACTION_TYPE.All) {
      participantToModify.isMicBlocked = value;
      participantToModify.isVideoBlocked = value;
      participantToModify.isScreenShareBlocked = value;
    } else {
      participantToModify.isMicBlocked =
        action === LOCK_ACTION_TYPE.Mic
          ? value
          : participantToModify.isMicBlocked;
      participantToModify.isVideoBlocked =
        action === LOCK_ACTION_TYPE.Camera
          ? value
          : participantToModify.isVideoBlocked;
      participantToModify.isScreenShareBlocked =
        action === LOCK_ACTION_TYPE.Screen
          ? value
          : participantToModify.isScreenShareBlocked;
    }
  };

  const setEveryParticipantActions = (action: number, value: boolean) => {
    participants.value = participants.value.map((part) => {
      if (action === LOCK_ACTION_TYPE.All) {
        return {
          ...part,
          isMicBlocked: value,
          isVideoBlocked: value,
          isScreenShareBlocked: value,
        };
      } else {
        return {
          ...part,
          isMicBlocked:
            action === LOCK_ACTION_TYPE.Mic ? value : part.isMicBlocked,
          isVideoBlocked:
            action === LOCK_ACTION_TYPE.Camera ? value : part.isVideoBlocked,
          isScreenShareBlocked:
            action === LOCK_ACTION_TYPE.Screen
              ? value
              : part.isScreenShareBlocked,
        };
      }
    });
  };

  const admittedParticipants = computed(() =>
    participants.value.filter((p) => p.denied === PERMISSION_STATUS.admitted)
  );

  const waitingParticipants = computed(() =>
    participants.value.filter((p) => p.denied === PERMISSION_STATUS.asked)
  );

  const updateParticipantDenied = (id: string, state: number) =>
    (participants.value.filter((p) => p.id === id)[0].denied = state);

  return {
    deleteAllParticipants,
    addParticipants,
    deleteParticipantById,
    participants,
    setParticipantActions,
    setEveryParticipantActions,
    admittedParticipants,
    waitingParticipants,
    updateParticipantDenied,
  };
}
