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
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { JitsiConferenceErrors } from '@solyd/lib-jitsi-meet/dist/esm/JitsiConferenceErrors';

export default defineComponent({
  name: 'FuPreview',
  setup() {
    const router = useRouter();
    JitsiMeetJS.init({});
    const videoTrack = ref({} as HTMLElement);
    const audioTrack = ref({} as HTMLElement);
    const localTracks = ref<JitsiLocalTrack[]>([]);
    onMounted(() => {
      JitsiMeetJS.createLocalTracks({
        devices: ['audio', 'video'],
      })
        .then((tracks: JitsiLocalTrack[] | JitsiConferenceErrors) => {
          localTracks.value = tracks as JitsiLocalTrack[];
          (tracks as JitsiLocalTrack[]).forEach((track: JitsiLocalTrack) => {
            if (track.getType() == 'audio') {
              track.attach(audioTrack.value);
            } else {
              track.attach(videoTrack.value);
            }
          });
        })
        .catch((error) => {
          console.error('There was an error creating the local tracks:', error);
        });
    });

    const gomeet = () => {
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
