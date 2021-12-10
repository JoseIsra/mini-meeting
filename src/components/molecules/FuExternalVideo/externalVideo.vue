<template>
  <section
    :class="['m-video', { miniMode: watchMinimized }]"
    :style="redimensionVideoSize"
  >
    <p v-show="infoMessage" class="m-video__message">
      Detenga el video para sincronizar
    </p>
    <video
      id="specialId"
      ref="videoPlayer"
      webkit-playsinline="true"
      class="video-js"
      :class="[{ 'vjs-poster': posterClass }, { 'vjs-youtube': posterClass }]"
      playsinline
    ></video>
  </section>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  computed,
  onBeforeUnmount,
} from 'vue';
import {
  useRoom,
  useScreen,
  useUserMe,
  useInitWebRTC,
  useExternalVideo,
} from '@/composables';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.css';
import { useQuasar } from 'quasar';
import { successMessage } from '@/utils/notify';

interface TestProp {
  enablejsapi: number;
  origin: string;
}
interface Test {
  youtube: TestProp;
}

export default defineComponent({
  name: 'FuExternalVideo',
  setup() {
    const orientationScreenAdvice = ref(false);
    const $q = useQuasar();
    let posterClass = ref(false);
    const calculateCurrentSelectedTime = ref(0);
    const { sendData } = useInitWebRTC();
    const { userMe } = useUserMe();
    const { externalVideo, setvideoOptions, updateExternalVideoState } =
      useExternalVideo();
    const videoPlayer = ref({} as HTMLMediaElement & { playerId: string });
    const player = ref<videojs.Player>({} as videojs.Player);
    const canManipulateVideo = ref(userMe.roleId === 0);
    const { screenMinimized } = useScreen();
    const infoMessage = ref(true);

    const optionsForPlayer = reactive<videojs.PlayerOptions & Test>({
      controls: !screenMinimized.value,
      bigPlayButton: false,
      autoplay: true,
      responsive: true,
      preload: 'auto',
      muted: true,
      nativeControlsForTouch: false,
      controlBar: {
        progressControl: {
          seekBar: true,
        },
      },
      techOrder: ['youtube'],
      sources: [
        {
          type: 'video/youtube',
          src: externalVideo.urlVideo as string,
        },
        {
          type: 'video/webm',
          src: externalVideo.urlVideo as string,
        },
      ],
      youtube: {
        enablejsapi: 1,
        origin: window.location.href,
      },
    });

    const { roomState } = useRoom();

    onMounted(() => {
      window.addEventListener('orientationchange', handleOrientationChange);
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          setvideoOptions(optionsForPlayer as videojs.PlayerOptions);
          updateExternalVideoState({
            ...externalVideo,
            remoteInstance: videoPlayer.value,
          });
          player.value.on('pause', handlePause);
          player.value.on('play', handlePlaying);
          player.value.on('timeupdate', () => {
            calculateCurrentSelectedTime.value =
              player.value.duration() - player.value.remainingTime();

            updateExternalVideoState({
              ...externalVideo,
              videoCurrentTime: player.value.currentTime(),
            });
          });
          player.value.on('ready', () => {
            posterClass.value = true;
          });
          player.value.controlBar.on('mouseup', () => {
            if (canManipulateVideo.value) {
              setTimeout(() => {
                sendData(roomState.hostId, {
                  remoteInstance: videoPlayer.value,
                  videoCurrentTime: calculateCurrentSelectedTime.value,
                  eventType: 'UPDATE_VIDEOTIME',
                });
              }, 200);
            }
          });
        }
      );
    });

    const handlePlaying = () => {
      updateExternalVideoState({
        ...externalVideo,
        isVideoPlaying: true,
      });
      void player.value.play();
      if (canManipulateVideo.value) {
        sendData(roomState.hostId, {
          remoteInstance: videoPlayer.value,
          videoCurrentTime: externalVideo.videoCurrentTime,
          eventType: 'PLAYING_VIDEO',
        });
      }
    };

    const handlePause = () => {
      updateExternalVideoState({
        ...externalVideo,
        isVideoPlaying: false,
      });

      if (canManipulateVideo.value && !infoMessage.value) {
        sendData(roomState.hostId, {
          remoteInstance: videoPlayer.value,
          videoCurrentTime: externalVideo.videoCurrentTime,
          eventType: 'PAUSE_VIDEO',
        });
      }
      if (infoMessage.value) {
        infoMessage.value = false;
        player.value.muted(false);
        void player.value.play();
        successMessage('Sincronización exitosa, puede continuar');
      }
    };

    onBeforeUnmount(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    });

    const handleOrientationChange = () => {
      const orientation = window.screen.orientation.type;
      if (orientation == 'landscape-primary') {
        orientationScreenAdvice.value = true;
        return;
      }
      orientationScreenAdvice.value = false;
    };

    const watchMinimized = computed(() => {
      return screenMinimized.value;
    });

    const redimensionVideoSize = computed(() => {
      return $q.screen.lt.sm
        ? {
            '--top': '40%',
            '--width': '100vw',
            '--height': '40vh',
          }
        : orientationScreenAdvice.value
        ? {
            '--top': '50%',
            '--width': '80vw',
            '--height': '70vh',
          }
        : {
            '--top': '50%',
            '--width': '60vw',
            '--height': '70vh',
          };
    });

    return {
      externalVideo,
      videoPlayer,
      player,
      handlePlaying,
      userMe,
      watchMinimized,
      posterClass,
      redimensionVideoSize,
      infoMessage,
    };
  },
});
</script>

<style lang="scss">
.vjs-youtube .vjs-poster {
  display: none !important;
}
@import './externalVideo.scss';
</style>
