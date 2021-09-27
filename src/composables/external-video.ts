import { reactive } from 'vue';
import videojs from 'video.js';

interface ExternalVideo {
  urlVideo: string;
  isPlaying: boolean;
}

const extVideo = reactive<ExternalVideo>({
  urlVideo: '',
  isPlaying: false,
});

const playerObject = reactive({} as videojs.Player);
const videoPlayerTest = reactive({} as HTMLVideoElement);
const optionsPlayerTest = reactive({} as videojs.PlayerOptions);

export function useExternalVideo() {
  const setUrlVideo = (value: string) => {
    extVideo.urlVideo = value;
  };

  const setPlayingVideoState = (value: boolean) => {
    extVideo.isPlaying = value;
  };

  const setvideoOptions = (value: videojs.PlayerOptions) => {
    Object.assign(optionsPlayerTest, value);
  };

  return {
    extVideo,
    setUrlVideo,
    setPlayingVideoState,
    playerObject,
    setvideoOptions,
    videoPlayerTest,
    optionsPlayerTest,
  };
}
