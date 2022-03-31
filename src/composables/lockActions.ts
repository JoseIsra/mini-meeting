import { useHandleParticipants } from '@/composables/participants';
import { useJitsi } from '@/composables/jitsi';
import { User, LockActionsObject } from '@/types';
import { LOCK_ACTION_TYPE } from '@/utils/enums';

const { admittedParticipants } = useHandleParticipants();
const { sendNotification } = useJitsi();

const lockActionsAllowed = new Map<
  number,
  (participant: User, action: number, blockData: LockActionsObject) => void
>();

export function useLockParticipantActions() {
  const isMicLocked = (participant: Partial<User>) =>
    admittedParticipants.value.find((part) => part.id === participant.id)
      ?.isMicBlocked === true;

  const isCameraLocked = (participant: Partial<User>) =>
    admittedParticipants.value.find((part) => part.id === participant.id)
      ?.isCameraBlocked === true;

  const isScreenSharingLocked = (participant: Partial<User>) =>
    admittedParticipants.value.find((part) => part.id === participant.id)
      ?.isScreenShareBlocked === true;

  const lockMic = (
    participant: User,
    action: number,
    lockData: LockActionsObject
  ) => {
    if (isMicLocked(participant)) {
      sendNotification('LOCK_PARTICIPANT_MIC', {
        value: JSON.stringify({
          ...lockData,
          locked: false,
        }),
      });
    } else {
      sendNotification('LOCK_PARTICIPANT_MIC', {
        value: JSON.stringify({
          ...lockData,
          locked: true,
        }),
      });
    }
  };

  const lockCamera = (
    participant: User,
    action: number,
    lockData: LockActionsObject
  ) => {
    if (isCameraLocked(participant)) {
      sendNotification('LOCK_PARTICIPANT_CAMERA', {
        value: JSON.stringify({
          ...lockData,
          locked: false,
        }),
      });
    } else {
      sendNotification('LOCK_PARTICIPANT_CAMERA', {
        value: JSON.stringify({
          ...lockData,
          locked: true,
        }),
      });
    }
  };

  const lockScreenSharing = (
    participant: User,
    action: number,
    lockData: LockActionsObject
  ) => {
    if (isScreenSharingLocked(participant)) {
      sendNotification('LOCK_PARTICIPANT_SCREEN_SHARING', {
        value: JSON.stringify({
          ...lockData,
          locked: false,
        }),
      });
    } else {
      sendNotification('LOCK_PARTICIPANT_SCREEN_SHARING', {
        value: JSON.stringify({
          ...lockData,
          locked: true,
        }),
      });
    }
  };

  lockActionsAllowed.set(LOCK_ACTION_TYPE.Mic, lockMic);
  lockActionsAllowed.set(LOCK_ACTION_TYPE.Camera, lockCamera);
  lockActionsAllowed.set(LOCK_ACTION_TYPE.Screen, lockScreenSharing);

  return {
    lockActionsAllowed,
  };
}
