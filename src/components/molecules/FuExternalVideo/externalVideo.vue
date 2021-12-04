<template>
  <section
    :class="['m-video', { miniMode: watchMinimized }]"
    :style="redimensionVideoSize"
  >
    <q-btn
      icon="play_arrow"
      v-show="showPlayButton"
      class="m-video__btn --playVideo"
      @click="handlePlaying"
    />
    <video
      id="specialId"
      :class="[{ 'vjs-poster': posterClass }, { 'vjs-youtube': posterClass }]"
      autoplay
      ref="videoPlayer"
      class="video-js"
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
    const showPlayButton = ref(false);
    const canManipulateVideo = ref(userMe.roleId === 0);
    const { screenMinimized } = useScreen();
    const optionsForPlayer = reactive<videojs.PlayerOptions>({
      controls: !screenMinimized.value,
      bigPlayButton: false,
      autoplay: true,
      responsive: true,
      controlBar: {
        progressControl: {
          seekBar: true,
        },
      },
      techOrder: ['youtube', 'html5'],
      sources: [
        {
          type: 'video/youtube',
          src: externalVideo.urlVideo as string,
        },
      ],
    });

    const { roomState } = useRoom();

    onMounted(() => {
      window.addEventListener('orientationchange', handleOrientationChange);
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          showPlayButton.value = true;
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
            void player.value.play();
          });
          player.value.controlBar.on('mouseup', () => {
            if (canManipulateVideo.value) {
              setTimeout(() => {
                sendData(roomState.hostId, {
                  remoteInstance: videoPlayer.value,
                  videoCurrentTime: calculateCurrentSelectedTime.value,
                  eventType: 'UPDATE_VIDEOTIME',
                });
              }, 500);
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

      showPlayButton.value = false;
      void player.value.play();

      if (canManipulateVideo.value) {
        sendData(roomState.hostId, {
          remoteInstance: videoPlayer.value,
          eventType: 'PLAYING_VIDEO',
        });
      }
    };

    const handlePause = () => {
      updateExternalVideoState({
        ...externalVideo,
        isVideoPlaying: false,
      });
      showPlayButton.value = true;

      if (canManipulateVideo.value) {
        sendData(roomState.hostId, {
          remoteInstance: videoPlayer.value,
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
      showPlayButton,
      userMe,
      watchMinimized,
      posterClass,
      redimensionVideoSize,
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
