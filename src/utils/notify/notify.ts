import { Notify } from 'quasar';

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

export const successMessage = notify('green');

export const warningMessage = notify('orange');

export const errorMessage = notify('red');
