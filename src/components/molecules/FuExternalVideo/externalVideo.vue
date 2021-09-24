<template>
  <section class="m-video">
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
    const { extVideo, setPlayingVideoState } = useExternalVideo();
    const videoPlayer = ref({} as HTMLVideoElement);
    const player = ref<videojs.Player>({} as videojs.Player);
    const optionsForPlayer = reactive({
      controls: true,
      autoplay: false,
      width: 600,
      height: 350,
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
      console.log('playing video');
      setPlayingVideoState(true);
      sendData(userMe.id, {
        eventType: 'PLAYING_VIDEO',
      });
    };

    const onPause = () => {
      console.log('video pauses 💤');
    };

    return {
      extVideo,
      videoPlayer,
      player,

      handlePlaying,
      onPause,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideo.scss';
</style>
