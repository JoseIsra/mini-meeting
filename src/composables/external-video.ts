import { reactive } from 'vue';
import videojs from 'video.js';

interface ExternalVideo {
  urlVideo?: string;
  videoOnRoom?: boolean;
  isVideoPlaying?: boolean;
  videoCurrentTime?: number;
}

const externalVideo = reactive<ExternalVideo>({
  urlVideo: '',
  videoOnRoom: false,
  isVideoPlaying: false,
  videoCurrentTime: 0,
});

const playerObject = reactive({} as videojs.Player);
const videoPlayerTest = reactive({} as HTMLMediaElement & { playerId: string });
const optionsPlayerTest = reactive({} as videojs.PlayerOptions);

export function useExternalVideo() {
  const updateExternalVideoState = (state: ExternalVideo) => {
    Object.assign(externalVideo, { ...externalVideo, ...state });
  };

  const setvideoOptions = (value: videojs.PlayerOptions) => {
    Object.assign(optionsPlayerTest, value);
  };

  const setVideoInstance = (value: HTMLMediaElement) => {
    Object.assign(videoPlayerTest, value);
  };

  return {
    externalVideo,
    playerObject,
    setvideoOptions,
    videoPlayerTest,
    optionsPlayerTest,
    updateExternalVideoState,
    setVideoInstance,
  };
}
