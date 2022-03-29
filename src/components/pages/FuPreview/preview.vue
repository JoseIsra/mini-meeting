<template>
  <div class="column items-center justify-center">
    <video
      style="width: 200px; heigth: 150px"
      ref="videoTrack"
      autoplay
    ></video>
    <audio ref="audioTrack" muted autoplay></audio>
    <q-btn label="cameraoff" no-caps @click="toggleCamera" />
    <q-btn label="Ingresar" color="green" @click="gomeet" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';

export default defineComponent({
  name: 'FuPreview',
  setup() {
    const router = useRouter();
    const videoTrack = ref({} as HTMLVideoElement);
    const audioTrack = ref({} as HTMLElement);
    const localTracks = ref<JitsiLocalTrack[]>([]);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        console.log('Stream de local user', stream);
        videoTrack.value.srcObject = stream;
      })
      .catch((error) => alert(error));

    const gomeet = () => {
      const streamCamera = videoTrack.value.srcObject as MediaStream;
      streamCamera.getTracks().forEach((track: MediaStreamTrack) => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      void router.push({
        name: 'meet',
        query: {
          roomId: 'chernobil',
          streamName: 'isra',
          isHost: 'true',
          roleId: '1',
        },
      });
    };

    const toggleCamera = () => {
      void localTracks.value[1].mute();
    };

    return {
      videoTrack,
      audioTrack,
      gomeet,
      toggleCamera,
    };
  },
});
</script>

<style scoped>
@import './preview.scss';
</style>
