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
    const { userMe, setPublicURLToShare, setUserSharingVideo } = useUserMe();
    const { externalVideo, setvideoOptions } = useExternalVideo();
    const videoPlayer = ref({} as HTMLVideoElement);
    const player = ref<videojs.Player>({} as videojs.Player);
    const showPlayButton = ref(false);
    const optionsForPlayer = reactive({
      controls: true,
      autoplay: false,
      bigPlayButton: false,
      responsive: true,
      controlBar: {
        progressControl: {
          seekBar: true,
        },
      },
      width: 800,
      height: 350,
      techOrder: ['youtube'],
      sources: [
        {
          type: 'video/youtube',
          src: externalVideo.urlVideo,
        },
      ],
    });
    onMounted(() => {
      player.value = videojs(
        videoPlayer.value,
        optionsForPlayer,
        function onPlayerReady() {
          showPlayButton.value = true;
          setvideoOptions(optionsForPlayer);
          sendData(userMe.id, {
            remoteInstance: videoPlayer.value,
            eventType: 'INITIALIZE_VIDEO',
          });
          setUserSharingVideo(true);
          setPublicURLToShare(externalVideo.urlVideo);
          player.value.on('pause', handlePause);
          player.value.on('play', handlePlaying);
          player.value.on('timeupdate', () => {
            console.log(player.value.currentTime());
          });
          player.value.controlBar.on('mouseup', () => {
            console.log('Barra en movimiento');
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
      externalVideo,
      videoPlayer,
      player,
      handlePlaying,
      showPlayButton,
      userMe,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideo.scss';
</style>
