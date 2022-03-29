import { reactive, ref } from 'vue';
import { PerifericsState } from '@/types/periferics';
import { User } from '@/types';

const perifericsState = {
  isMicOn: true,
  isCameraOn: false,
  isScreenShared: false,
  cameraId: '',
  isVideoActivated: false,
};

const perifericsControl = reactive<PerifericsState>(perifericsState);
const userDevicesDetected = ref<MediaDeviceInfo[]>([]);
const mediaConstraints = ref<string[]>([]);

export function usePerifericsControls() {
  const setMicState = (value: boolean) => {
    perifericsControl.isMicOn = value;
  };
  const setCameraState = (value: boolean) => {
    perifericsControl.isCameraOn = value;
  };

  const setScreenState = (value: boolean) => {
    perifericsControl.isScreenShared = value;
  };

  const setCameraDevice = (value: string) => {
    perifericsControl.cameraId = value;
  };

  const setVideoActivatedState = (value: boolean) => {
    perifericsControl.isVideoActivated = value;
  };

  const setDevicesDetected = (value: MediaDeviceInfo[]) => {
    userDevicesDetected.value = value;
  };

  const validateDevices = (user: User) => {
    if (user.hasWebcam && !user.hasMic) {
      mediaConstraints.value = ['video'];
    } else if (!user.hasWebcam && user.hasMic) {
      mediaConstraints.value = ['audio'];
    } else {
      mediaConstraints.value = ['audio', 'video'];
    }
  };

  return {
    perifericsControl,
    setMicState,
    setCameraState,
    setScreenState,
    setCameraDevice,
    setVideoActivatedState,
    setDevicesDetected,
    userDevicesDetected,
    mediaConstraints,
    validateDevices,
  };
}
