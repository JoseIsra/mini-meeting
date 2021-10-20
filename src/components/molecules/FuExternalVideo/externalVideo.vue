<template>
  <section
    :class="['m-video', { miniMode: watchMinimized }]"
    :style="redimensionVideoSize"
  >
    <q-btn
      :style="[simpleMortal ? { visibility: 'hidden' } : '']"
      icon="play_arrow"
      v-show="showPlayButton"
      class="m-video__btn --playVideo"
      @click="handlePlaying"
    />
    <video
      autoplay
      id="specialId"
      :class="[
        { 'vjs-poster': posterClass },
        { 'vjs-youtube': posterClass },
        { 'vjs-tech': simpleMortal },
      ]"
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
import { useExternalVideo } from '@/composables/external-video';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.css';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { useScreen } from '@/composables/screen';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuExternalVideo',
  setup() {
    const orientationScreenAdvice = ref(false);
    const $q = useQuasar();
    let posterClass = ref(false);
    const calculateCurrentSelectedTime = ref(0);
    const { sendData } = useInitWebRTC();
    const { userMe, updateUserMe } = useUserMe();
    const { externalVideo, setvideoOptions, setVideoInstance } =
      useExternalVideo();
    const videoPlayer = ref({} as HTMLMediaElement & { playerId: string });
    const player = ref<videojs.Player>({} as videojs.Player);
    const showPlayButton = ref(false);
    const canManipulateVideo = ref(userMe.roleId === 0);
    const simpleMortal = ref(userMe.roleId == 1);
    const { screenMinimized } = useScreen();
    const optionsForPlayer = reactive<videojs.PlayerOptions>({
      controls: canManipulateVideo.value || screenMinimized.value,
      autoplay: true,
      bigPlayButton: false,
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

    onMounted(() => {
      window.addEventListener('orientationchange', handleOrientationChange);
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          showPlayButton.value = true;
          setvideoOptions(optionsForPlayer as videojs.PlayerOptions);
          setVideoInstance(videoPlayer.value);
          updateUserMe({
            ...userMe,
            existVideo: externalVideo.videoOnRoom,
            urlOfVideo: externalVideo.urlVideo,
            videoInstance: videoPlayer.value,
          });
          player.value.on('pause', handlePause);
          player.value.on('play', handlePlaying);
          player.value.on('timeupdate', () => {
            calculateCurrentSelectedTime.value =
              player.value.duration() - player.value.remainingTime();
            updateUserMe({
              ...userMe,
              currentTime: player.value.currentTime(),
            });
          });
          player.value.on('ready', () => {
            posterClass.value = true;
            console.log('go on video go on🤭', posterClass.value);
            void player.value.play();
          });
          player.value.controlBar.on('mouseup', () => {
            setTimeout(() => {
              sendData(userMe.id, {
                remoteInstance: videoPlayer.value,
                currentTime: calculateCurrentSelectedTime.value,
                eventType: 'UPDATE_VIDEOTIME',
              });
            }, 500);
          });
        }
      );
    });

    const handlePlaying = () => {
      updateUserMe({
        ...userMe,
        isPlayingVideo: true,
      });
      showPlayButton.value = false;
      void player.value.play();
      sendData(userMe.id, {
        remoteInstance: videoPlayer.value,
        eventType: 'PLAYING_VIDEO',
      });
    };

    const handlePause = () => {
      updateUserMe({
        ...userMe,
        isPlayingVideo: false,
      });
      showPlayButton.value = true;
      sendData(userMe.id, {
        remoteInstance: videoPlayer.value,
        eventType: 'PAUSE_VIDEO',
      });
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
      simpleMortal,
      watchMinimized,
      posterClass,
      redimensionVideoSize,
    };
  },
});
</script>

<style lang="scss" scoped>
// .vjs-youtube .vjs-poster {
//   display: none !important;
// }
@import './externalVideo.scss';
</style>
