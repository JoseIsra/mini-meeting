import { reactive } from 'vue';
import videojs from 'video.js';
import { ExternalVideoObject } from '@/types';

const externalVideo = reactive<ExternalVideoObject>({
  urlVideo: '',
  videoOnRoom: false,
  isVideoPlaying: false,
  videoCurrentTime: 0,
  remoteInstanceId: '',
  videoOwnerId: '',
});

const playerObject = reactive({} as videojs.Player);
const optionsPlayerTest = reactive({} as videojs.PlayerOptions);

export function useExternalVideo() {
  const updateExternalVideoState = (state: ExternalVideoObject) => {
    Object.assign(externalVideo, { ...externalVideo, ...state });
  };

  const setvideoOptions = (value: videojs.PlayerOptions) => {
    Object.assign(optionsPlayerTest, value);
  };

  return {
    externalVideo,
    playerObject,
    setvideoOptions,
    optionsPlayerTest,
    updateExternalVideoState,
  };
}
