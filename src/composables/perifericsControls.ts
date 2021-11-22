import { reactive, ref } from 'vue';
import { PerifericsState } from '@/types/periferics';

const perifericsState = {
  isMicOn: true,
  isCameraOn: false,
  isScreenShared: false,
  cameraId: '',
  isVideoActivated: false,
};

const perifericsControl = reactive<PerifericsState>(perifericsState);
const userDevicesDetected = ref<MediaDeviceInfo[]>([]);
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

  return {
    perifericsControl,
    setMicState,
    setCameraState,
    setScreenState,
    setCameraDevice,
    setVideoActivatedState,
    setDevicesDetected,
    userDevicesDetected,
  };
}
