<template>
  <section class="m-video">
    <!-- <video ref="videoPlayer" class="video-js vjs-default-skin"></video> -->
    <video ref="videoPlayer" class="video-js vjs-fluid"></video>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  onBeforeUnmount,
} from 'vue';
import { useExternalVideo } from '@/composables/external-video';
import videojs from 'video.js';
import 'video.js/dist/video.min.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.min.css';
import 'video.js/dist/video-js.css';
export default defineComponent({
  name: 'FuExternalVideo',
  setup() {
    const { extVideo } = useExternalVideo();
    const videoPlayer = ref({} as HTMLVideoElement);
    const player = ref<videojs.Player>({} as videojs.Player);
    const optionsForPlayer = {
      autoplay: true,
      controls: true,
      width: 640,
      height: 264,
      'data-setup': {
        techOrder: ['youtube'],
        sources: [
          {
            type: 'video/youtube',
            src: 'https://www.youtube.com/watch?v=Win0IrjKQVU',
          },
        ],
      },
    };
    onMounted(() => {
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          console.log('playing i guess....', player.value);
        }
      );
    });

    onBeforeUnmount(() => {
      if (player.value) {
        player.value.dispose();
      }
    });

    return {
      extVideo,
      videoPlayer,
      player,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideo.scss';
</style>
