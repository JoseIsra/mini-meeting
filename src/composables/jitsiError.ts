import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import { useUserMe } from '@/composables/userMe';
import { useJitsi } from '@/composables/jitsi';
import { useAuthState } from './auth';

const { updateUserMe } = useUserMe();
const { getLocalTracks } = useJitsi();
const { setLoadingOrErrorMessage } = useAuthState();

export function useJitsiError() {
  const errorsCallback = (error: string, message: string) => {
    if (error == JitsiMeetJS.errors.track.CONSTRAINT_FAILED) {
      console.log('Constraints error', { error, message });
    } else if (error == JitsiMeetJS.errors.track.NOT_FOUND) {
      console.log('Not found errors', { error, message });
      setLoadingOrErrorMessage('No camera, inicializando micrófono');
      if (message.includes('video')) {
        updateUserMe({
          hasWebcam: false,
        });
        setTimeout(() => {
          getLocalTracks(['audio']);
        }, 1000);
      }
    } else if (error == JitsiMeetJS.errors.track.PERMISSION_DENIED) {
      console.log('Permissions error', { error, message });
      if (message.includes('video')) {
        setLoadingOrErrorMessage('Camara bloqueada, inicializando micrófono');
        updateUserMe({
          hasWebcam: false,
        });
        setTimeout(() => {
          getLocalTracks(['audio']);
        }, 1000);
      } else if (message.includes('audio')) {
        updateUserMe({
          hasMic: false,
        });
        getLocalTracks(['video']);
        setLoadingOrErrorMessage('Micrófono bloqueado, inicializando cámara');
      }
    }
  };

  return {
    errorsCallback,
  };
}
