<template>
  <section class="m-full">
    <fu-full-screen-user v-if="fullScreenMode === 'user'" />
    <fu-external-video v-if="fullScreenMode === 'video'" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuFullScreenUser from 'molecules/FuFullScreenUser';
import { useToogleFunctions } from '@/composables';
import FuExternalVideo from 'molecules/FuExternalVideo';

export default defineComponent({
  name: 'FuFullScreen',
  components: { FuFullScreenUser, FuExternalVideo },
  setup() {
    const { fullScreenMode, fullScreenObject } = useToogleFunctions();
    return {
      fullScreenMode,
      fullScreenObject,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
