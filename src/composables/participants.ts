import { ref, computed } from 'vue';

import { LOCK_ACTION_TYPE, PERMISSION_STATUS, USER_ROLE } from '@/utils/enums';
import _ from 'lodash';
import { User } from '@/types/user';

const participants = ref<User[]>([]);

export function useHandleParticipants() {
  const addParticipant = (value: User) => {
    const newParticipants = _.cloneDeep(participants.value);
    newParticipants.push(value);
    participants.value = newParticipants;
  };

  const deleteParticipantById = (id: string) => {
    const newParticipants = _.cloneDeep(participants.value);
    participants.value = newParticipants.filter(
      (participant) => participant.id !== id
    );
  };

  const findParticipantById = (id: string) => {
    const participantFound = participants.value.find(
      (participant) => participant.id === id
    );
    return participantFound;
  };

  const deleteAllParticipants = () => {
    participants.value.splice(0, 1);
  };

  const updateParticipantById = (id: string, fields: Partial<User>) => {
    const newParticipants = _.cloneDeep(participants.value);
    const participantFound = newParticipants.find(
      (participant) => participant.id == id
    );
    fields.stream = participantFound?.stream; //For not replacing the stream
    Object.assign(participantFound, fields);
    participants.value = newParticipants;
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
      participantToModify.isCameraBlocked = value;
      participantToModify.isScreenShareBlocked = value;
    } else {
      participantToModify.isMicBlocked =
        action === LOCK_ACTION_TYPE.Mic
          ? value
          : participantToModify.isMicBlocked;
      participantToModify.isCameraBlocked =
        action === LOCK_ACTION_TYPE.Camera
          ? value
          : participantToModify.isCameraBlocked;
      participantToModify.isScreenShareBlocked =
        action === LOCK_ACTION_TYPE.Screen
          ? value
          : participantToModify.isScreenShareBlocked;
    }
  };

  const setEveryParticipantActions = (action: number, value: boolean) => {
    participants.value = participants.value.map((part) => {
      if (part.roleId === USER_ROLE.ADMINISTRATOR) {
        return part;
      } else {
        if (action === LOCK_ACTION_TYPE.All) {
          return {
            ...part,
            isMicBlocked: value,
            isCameraBlocked: value,
            isScreenShareBlocked: value,
          };
        } else {
          return {
            ...part,
            isMicBlocked:
              action === LOCK_ACTION_TYPE.Mic ? value : part.isMicBlocked,
            isCameraBlocked:
              action === LOCK_ACTION_TYPE.Camera ? value : part.isCameraBlocked,
            isScreenShareBlocked:
              action === LOCK_ACTION_TYPE.Screen
                ? value
                : part.isScreenShareBlocked,
          };
        }
      }
    });
  };

  const admittedParticipants = computed(() =>
    participants.value.filter((p) => p.denied === PERMISSION_STATUS.admitted)
  );

  const waitingParticipants = computed(() =>
    participants.value.filter((p) => p.denied === PERMISSION_STATUS.asked)
  );

  const updateParticipantDenied = (id: string, state: number) => {
    participants.value.filter((p) => p.id === id)[0].denied = state;
  };

  return {
    deleteAllParticipants,
    updateParticipantById,
    addParticipant,
    deleteParticipantById,
    participants,
    setParticipantActions,
    setEveryParticipantActions,
    admittedParticipants,
    waitingParticipants,
    updateParticipantDenied,
    findParticipantById,
  };
}
