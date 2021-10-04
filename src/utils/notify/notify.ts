import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { Notify } from 'quasar';

const { sendData } = useInitWebRTC();
const { userMe } = useUserMe();

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
        },
      },
    ],
  });
};

export const successMessage = notify('green');

export const warningMessage = notify('orange');

export const errorMessage = notify('red');
