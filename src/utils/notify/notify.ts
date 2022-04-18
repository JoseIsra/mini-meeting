import { Notify } from 'quasar';

// const waitingSound = new Audio(
//   'https://freesound.org/data/previews/415/415763_6090639-lq.mp3'
// );

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

export const notifyWithAction = (): void => {
  Notify.create({
    position: 'bottom-left',
    message: `Se ha compartido un video en la sala,
      dale play para sincronizarlo`,
    color: 'primary',
    timeout: 10000,
    actions: [
      {
        label: 'OK',
        color: 'yellow',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        handler: () => {},
      },
    ],
  });
};

export const successMessage = notify('green');

export const warningMessage = notify('orange');

export const errorMessage = notify('red');
