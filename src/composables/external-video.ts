import { reactive } from 'vue';
import videojs from 'video.js';

interface ExternalVideo {
  urlVideo: string;
  thereIsVideo: boolean;
}

const externalVideo = reactive<ExternalVideo>({
  urlVideo: '',
  thereIsVideo: false,
});

const playerObject = reactive({} as videojs.Player);
const videoPlayerTest = reactive({} as HTMLVideoElement);
const optionsPlayerTest = reactive({} as videojs.PlayerOptions);

export function useExternalVideo() {
  const setUrlVideo = (value: string) => {
    externalVideo.urlVideo = value;
  };

  const isVideoRender = (value: boolean) => {
    externalVideo.thereIsVideo = value;
  };

  const setvideoOptions = (value: videojs.PlayerOptions) => {
    Object.assign(optionsPlayerTest, value);
  };

  return {
    externalVideo,
    setUrlVideo,
    isVideoRender,
    playerObject,
    setvideoOptions,
    videoPlayerTest,
    optionsPlayerTest,
  };
}
