<template>
  <div class="column items-center justify-center">
    <!-- <avatar ref="avatar" username="miavatar" /> -->
    <video
      style="width: 200px; heigth: 150px"
      ref="videoTrack"
      autoplay
    ></video>
    <audio ref="audioTrack" muted autoplay></audio>
    <q-btn label="Ingresar" color="green" @click="gomeet" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
// import Avatar from 'vue-avatar';

export default defineComponent({
  name: 'FuPreview',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // components: { Avatar },
  setup() {
    const router = useRouter();
    const videoTrack = ref({} as HTMLVideoElement);
    const audioTrack = ref({} as HTMLElement);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        console.log('Stream de local user', stream);
        videoTrack.value.srcObject = stream;
      })
      .catch((error) => console.log(error));

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
          streamName: 'student',
          isHost: 'false',
          roleId: '1',
        },
      });
    };

    return {
      videoTrack,
      audioTrack,
      gomeet,
    };
  },
});
</script>

<style scoped>
@import './preview.scss';
</style>
