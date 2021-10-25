import { reactive } from 'vue';
import videojs from 'video.js';
import { ExternalVideoObject } from '@/types/datachannelMessages';

const externalVideo = reactive<ExternalVideoObject>({
  urlVideo: '',
  videoOnRoom: false,
  isVideoPlaying: false,
  videoCurrentTime: 0,
  remoteInstance: {} as HTMLVideoElement,
});

const playerObject = reactive({} as videojs.Player);
const videoPlayerTest = reactive({} as HTMLMediaElement & { playerId: string });
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
    videoPlayerTest,
    optionsPlayerTest,
    updateExternalVideoState,
  };
}
