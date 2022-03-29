import JitsiMeetJS from '@solyd/lib-jitsi-meet';

export function useJitsiError() {
  const errorsCallback = (error: string, message: string) => {
    console.log(error, message);
    if (error == JitsiMeetJS.errors.track.CONSTRAINT_FAILED) {
      alert(message);
    } else if (error == JitsiMeetJS.errors.track.NOT_FOUND) {
      alert(message);
    } else if (error == JitsiMeetJS.errors.track.PERMISSION_DENIED) {
      alert(message);
    }
  };

  return {
    errorsCallback,
  };
}
