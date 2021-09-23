import { reactive } from 'vue';

interface ExternalVideo {
  urlVideo: string;
  isPlaying: boolean;
}

const extVideo = reactive<ExternalVideo>({
  urlVideo: '',
  isPlaying: false,
});

export function useExternalVideo() {
  const setUrlVideo = (value: string) => {
    extVideo.urlVideo = value;
  };

  const setPlayingVideoState = (value: boolean) => {
    extVideo.isPlaying = value;
  };

  return {
    extVideo,
    setUrlVideo,
    setPlayingVideoState,
  };
}
