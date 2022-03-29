import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import { useUserMe } from '@/composables/userMe';
import { useJitsi } from '@/composables/jitsi';

const { updateUserMe } = useUserMe();
const { getLocalTracks } = useJitsi();

export function useJitsiError() {
  const errorsCallback = (error: string, message: string) => {
    if (error == JitsiMeetJS.errors.track.CONSTRAINT_FAILED) {
      console.log('Constraints error', { error, message });
    } else if (error == JitsiMeetJS.errors.track.NOT_FOUND) {
      console.log('Not found errors', { error, message });
      if (message.includes('video')) {
        updateUserMe({
          hasWebcam: false,
        });
        getLocalTracks(['audio']);
      }
    } else if (error == JitsiMeetJS.errors.track.PERMISSION_DENIED) {
      console.log('Permissions error', { error, message });
      if (message.includes('video')) {
        updateUserMe({
          hasWebcam: false,
        });
        getLocalTracks(['audio']);
      } else if (message.includes('audio')) {
        updateUserMe({
          hasMic: false,
        });
        getLocalTracks(['video']);
      }
    }
  };

  return {
    errorsCallback,
  };
}
