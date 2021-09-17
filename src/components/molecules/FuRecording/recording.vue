<template>
  <div>
    <q-btn
      v-if="!isRecording"
      color="primary"
      icon="fas fa-record-vinyl"
      :label="isLoading ? 'Cargando...' : 'Iniciar Grabación'"
      @click="startRecording"
    />
    <q-btn
      v-if="isRecording && !isLoading"
      color="negative"
      icon="fas fa-record-vinyl"
      :label="`Detener Grabación ${recordTime}`"
      @click="stopRecording"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useInitMerge } from '@/composables/antMediaMerge';
import { useUserMe } from '@/composables/userMe';
import { useRoom } from '@/composables/room';
import { ZoidWindow } from '@/types/zoid';

export default defineComponent({
  name: 'FuMRecording',
  setup() {
    const interval = ref();
    const recordTime = ref('00:00:00');
    const secondsElapsed = ref(0);
    const isRecording = ref<boolean>(false);
    const { createMergeInstance, stopMerge } = useInitMerge();
    const { roomState } = useRoom();
    const { userMe } = useUserMe();
    const isLoading = ref(false);

    const mergedName = ref('');

    const oneSecondElapsed = () => {
      secondsElapsed.value++;
      /* console.log(secondsElapsed.value); */
      recordTime.value = new Date(secondsElapsed.value * 1000)
        .toISOString()
        .substr(11, 8);
    };

    const startRecording = () => {
      const timestamp = new Date().getTime();

      isLoading.value = true;

      mergedName.value = `m-r-${roomState.id}-${timestamp}`;

      createMergeInstance(roomState.id, mergedName.value, mergedName.value)
        .then(() => {
          isLoading.value = false;
          interval.value = setInterval(oneSecondElapsed, 1000);
          isRecording.value = true;
        })
        .catch((e) => console.log(e));
    };

    const stopRecording = () => {
      isRecording.value = false;
      recordTime.value = '00:00:00';
      clearInterval(interval.value);
      stopMerge();
      secondsElapsed.value = 0;
      (window as ZoidWindow).xprops?.handleStopRecording?.(
        `https://f002.backblazeb2.com/file/antmedia/${mergedName.value}.m3u8`
      );
    };

    return {
      isRecording,
      startRecording,
      stopRecording,
      recordTime,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './recording.scss';
</style>
