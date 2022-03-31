import { useHandleParticipants } from '@/composables/participants';
import { useJitsi } from '@/composables/jitsi';
import { User } from '@/types';
import { LOCK_ACTION_TYPE } from '@/utils/enums';

interface Prueba {
  streamId: string;
  participantId: string;
  action: number;
}

const { setParticipantActions, admittedParticipants } = useHandleParticipants();
const { sendNotification } = useJitsi();

const lockActionsAllowed = new Map<
  number,
  (participant: User, action: number, otro: Prueba) => void
>();

export function useLockParticipantActions() {
  const isMicBlocked = (participant: Partial<User>) =>
    admittedParticipants.value.find((part) => part.id === participant.id)
      ?.isMicBlocked === true;

  const blockMic = (participant: User, action: number, otro: Prueba) => {
    if (isMicBlocked(participant)) {
      setParticipantActions(participant.id, action, false);
      sendNotification('BLOCK_PARTICIPANT_MIC', {
        value: JSON.stringify({
          ...otro,
          blocked: false,
        }),
      });
    } else {
      setParticipantActions(participant.id, action, true);
      sendNotification('BLOCK_PARTICIPANT_MIC', {
        value: JSON.stringify({
          ...otro,
          blocked: true,
        }),
      });
    }
  };

  lockActionsAllowed.set(LOCK_ACTION_TYPE.Mic, blockMic);

  return {
    lockActionsAllowed,
  };
}
