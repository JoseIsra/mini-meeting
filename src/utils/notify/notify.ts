import { Notify } from 'quasar';

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
        color: 'red',
        handler: () => {
          console.log(name);
          console.log(id);
        },
      },
      {
        label: 'Permitir',
        color: 'green',
        handler: () => {
          console.log(name);
          console.log(id);
        },
      },
    ],
  });
};

export const successMessage = notify('green');

export const warningMessage = notify('orange');

export const errorMessage = notify('red');
