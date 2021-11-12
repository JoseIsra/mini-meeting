import { useInitWebRTC } from '@/composables/antMedia';
import { useRoom, useHandleParticipants } from '@/composables';
import { Notify } from 'quasar';
import { PERMISSION_STATUS } from '../enums';

const { sendData } = useInitWebRTC();
const { updateParticipantDenied } = useHandleParticipants();
const { roomState } = useRoom();

const waitingSound = new Audio(
  'https://freesound.org/data/previews/415/415763_6090639-lq.mp3'
);

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
  waitingSound.currentTime = 0;
  void waitingSound.play();
  Notify.create({
    position: 'bottom',
    message: `${name} ha solicitado unirse`,
    color: 'primary',
    timeout: 5000,
    actions: [
      {
        label: 'Denegar',
        color: 'grey',
        handler: () => {
          sendData(roomState.hostId, {
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
        color: 'white',
        handler: () => {
          sendData(roomState.hostId, {
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
