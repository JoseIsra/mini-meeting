import { reactive } from 'vue';
import { WebRTCAdaptorType } from '@/types';

let webRTCInstance = reactive<WebRTCAdaptorType>({});

export function useInitWebRTC() {
  const setWebRTC = (value: WebRTCAdaptorType) => {
    // Object.assign(webRTCInstance, value);
    webRTCInstance = value;
  };
  return {
    setWebRTC,
    webRTCInstance,
  };
}
