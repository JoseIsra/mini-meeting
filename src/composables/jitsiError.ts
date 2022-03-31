import { nextTick } from 'vue';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import { useUserMe } from '@/composables/userMe';
import { useJitsi } from '@/composables/jitsi';
import { useAuthState } from '@/composables/auth';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { JitsiConferenceErrors } from '@solyd/lib-jitsi-meet/dist/esm/JitsiConferenceErrors';

const { updateUserMe, setScreenState, localTracks, localVideoTrack } =
  useUserMe();
const { getLocalTracks, roomAddTrack } = useJitsi();
const { setLoadingOrErrorMessage } = useAuthState();
type JitsiTrackType = JitsiLocalTrack[] | JitsiConferenceErrors;

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
    } else if (error == JitsiMeetJS.errors.track.SCREENSHARING_USER_CANCELED) {
      console.log('SCREEN CANCELED', {
        error,
        message,
      });
      setScreenState(false);
      // resetLocalVideoTrack();
      JitsiMeetJS.createLocalTracks({
        devices: ['video'],
      })
        .then((tracks: JitsiTrackType) => {
          localTracks.value.push(tracks[0] as JitsiLocalTrack);
          void nextTick(() => {
            localTracks.value[1].attach(localVideoTrack.value);
          });
          roomAddTrack(localTracks.value[1]);
          void localTracks.value[1].mute();
        })
        .catch((error) => console.error(error));
    }
  };

  return {
    errorsCallback,
  };
}
