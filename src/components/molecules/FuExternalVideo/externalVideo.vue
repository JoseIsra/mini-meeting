<template>
  <section class="m-video">
    <q-btn
      icon="play_arrow"
      v-show="showPlayButton"
      class="m-video__btn --playVideo"
      @click="handlePlaying"
    />
    <video ref="videoPlayer" class="video-js vjs-default-skin"></video>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  reactive,
} from 'vue';
import { useExternalVideo } from '@/composables/external-video';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.css';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
export default defineComponent({
  name: 'FuExternalVideo',
  setup() {
    const { sendData } = useInitWebRTC();
    const { userMe } = useUserMe();
    const { extVideo, setvideoOptions } = useExternalVideo();
    const videoPlayer = ref({} as HTMLVideoElement);
    const player = ref<videojs.Player>({} as videojs.Player);
    const showPlayButton = ref(false);
    const optionsForPlayer = reactive({
      controls: true,
      autoplay: false,
      bigPlayButton: false,
      responsive: true,
      width: 800,
      height: 450,
      techOrder: ['youtube'],
      sources: [
        {
          type: 'video/youtube',
          src: extVideo.urlVideo,
        },
      ],
    });
    onMounted(() => {
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          if (player.value) {
            showPlayButton.value = true;
            setvideoOptions(optionsForPlayer);
            sendData(userMe.id, {
              remoteInstance: videoPlayer.value,
              eventType: 'INITIALIZE_VIDEO',
            });
            player.value.on('pause', handlePause);
            player.value.on('play', handlePlaying);
          }
        }
      );
    });

    onBeforeUnmount(() => {
      if (player.value) {
        player.value.dispose();
      }
    });

    const handlePlaying = () => {
      showPlayButton.value = false;
      void player.value.play();
      sendData(userMe.id, {
        remoteInstance: videoPlayer.value,
        eventType: 'PLAYING_VIDEO',
      });
    };

    const handlePause = () => {
      showPlayButton.value = true;
      sendData(userMe.id, {
        remoteInstance: videoPlayer.value,
        eventType: 'PAUSE_VIDEO',
      });
    };

    return {
      extVideo,
      videoPlayer,
      player,
      handlePlaying,
      showPlayButton,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideo.scss';
</style>
