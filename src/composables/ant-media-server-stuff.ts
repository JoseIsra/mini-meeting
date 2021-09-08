import { ref } from 'vue';
import { objWebRTC } from '@/types';

const objStreams = ref<objWebRTC[]>([]);

export function useHandleParticipants() {
  const addParticipants = (value: objWebRTC) => {
    // Object.assign(webRTCInstance, value);
    objStreams.value.push(value);
  };
  return {
    addParticipants,
    objStreams,
  };
}
