<template>
  <section :class="['m-video', { miniMode: watchMinimized }]">
    <q-btn
      :style="[simpleMortal ? { visibility: 'hidden' } : '']"
      icon="play_arrow"
      v-show="showPlayButton"
      class="m-video__btn --playVideo"
      @click="handlePlaying"
    />
    <video
      :class="{ 'vjs-tech': simpleMortal }"
      ref="videoPlayer"
      class="video-js vjs-16-9"
    ></video>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
} from 'vue';
import { useExternalVideo } from '@/composables/external-video';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.css';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { useScreen } from '@/composables/screen';

export default defineComponent({
  name: 'FuExternalVideo',
  setup() {
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
      fluid: true,
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
    });
    onMounted(() => {
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

    onBeforeUnmount(() => {
      if (player.value) {
        player.value.dispose();
      }
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

    const watchMinimized = computed(() => {
      return screenMinimized.value;
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
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideo.scss';
</style>
