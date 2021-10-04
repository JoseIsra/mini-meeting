import { useInitWebRTC } from '@/composables/antMedia';
import { useHandleParticipants } from '@/composables/participants';
import { useUserMe } from '@/composables/userMe';
import { Notify } from 'quasar';
import { PERMISSION_STATUS } from '../enums';

const { sendData } = useInitWebRTC();
const { userMe } = useUserMe();

const { updateParticipantDenied } = useHandleParticipants();

export interface notifyAction {
  label: string;
  color: string;
  handler: void;
}

const notify =
  (color: string) =>
  (message: string): void => {
    Notify.create({
      position: 'bottom',
      message,
      color,
      timeout: 3000,
    });
  };

export const notifyWithAction = (name: string, id: string): void => {
  Notify.create({
    position: 'bottom',
    message: `${name} ha solicititado unirse`,
    color: 'blue',
    timeout: 5000,
    actions: [
      {
        label: 'Denegar',
        color: 'white',
        handler: () => {
          sendData(userMe.id, {
            id: '',
            participantId: id,
            eventType: 'ANSWER_PERMISSION',
            value: false,
          });

          updateParticipantDenied(id, PERMISSION_STATUS.denied);
        },
      },
      {
        label: 'Permitir',
        color: 'black',
        handler: () => {
          sendData(userMe.id, {
            id: '',
            participantId: id,
            eventType: 'ANSWER_PERMISSION',
            value: true,
          });

          updateParticipantDenied(id, PERMISSION_STATUS.admitted);
        },
      },
    ],
  });
};

export const successMessage = notify('green');

export const warningMessage = notify('orange');

export const errorMessage = notify('red');
