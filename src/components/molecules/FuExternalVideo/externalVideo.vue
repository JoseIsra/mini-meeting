<template>
  <section
    :class="['m-video', { miniMode: watchMinimized }]"
    :style="redimensionVideoSize"
  >
    <p v-show="infoMessage && !canManipulateVideo" class="m-video__message">
      Video compartido en la sala, reproduzca el video para su sincronización
    </p>
    <video
      id="specialId"
      ref="videoPlayer"
      webkit-playsinline="true"
      class="video-js"
      :class="[
        { 'vjs-poster': posterClass },
        { 'vjs-youtube': posterClass },
        { 'vjs-tech': !infoMessage && !canManipulateVideo },
      ]"
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
  useHandleParticipants,
} from '@/composables';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.css';
import { useQuasar } from 'quasar';

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
    const canManipulateVideo = ref(userMe.videoOwner);
    const { screenMinimized } = useScreen();
    const infoMessage = ref(true);
    const infoHelperMessage = ref('');
    const { admittedParticipants } = useHandleParticipants();

    const optionsForPlayer = reactive<videojs.PlayerOptions & Test>({
      controls: !screenMinimized.value && canManipulateVideo.value,
      bigPlayButton: false,
      autoplay: false,
      responsive: true,
      preload: 'auto',
      muted: false,
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
      ],
      youtube: {
        enablejsapi: 1,
        origin: window.location.href,
      },
    });

    const { roomState } = useRoom();

    onMounted(() => {
      window.addEventListener('orientationchange', handleOrientationChange);
      initVideoJs();
    });

    const initVideoJs = () => {
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          setvideoOptions(optionsForPlayer as videojs.PlayerOptions);
          updateExternalVideoState({
            ...externalVideo,
            remoteInstanceId: videoPlayer.value.playerId,
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
                  remoteInstanceId: videoPlayer.value.playerId,
                  videoCurrentTime: calculateCurrentSelectedTime.value,
                  eventType: 'UPDATE_VIDEOTIME',
                });
              }, 200);
            }
          });
        }
      );
    };

    const handlePlaying = () => {
      updateExternalVideoState({
        ...externalVideo,
        isVideoPlaying: true,
      });
      void player.value.play();
      if (canManipulateVideo.value) {
        sendData(roomState.hostId, {
          remoteInstanceId: videoPlayer.value.playerId,
          videoCurrentTime: externalVideo.videoCurrentTime,
          eventType: 'PLAYING_VIDEO',
        });
      }

      if (!canManipulateVideo.value) {
        infoMessage.value = false;
      }
    };

    const handlePause = () => {
      updateExternalVideoState({
        ...externalVideo,
        isVideoPlaying: false,
      });

      if (canManipulateVideo.value) {
        sendData(roomState.hostId, {
          remoteInstanceId: videoPlayer.value.playerId,
          videoCurrentTime: externalVideo.videoCurrentTime,
          eventType: 'PAUSE_VIDEO',
        });
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
            '--width': '90vw',
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

    const getOwnerTime = computed(() => {
      return admittedParticipants.value.find(
        (a) => a.id == externalVideo.videoOwnerId
      );
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
      canManipulateVideo,
      infoHelperMessage,
      getOwnerTime,
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
