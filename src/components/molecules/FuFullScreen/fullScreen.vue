<template>
  <section class="m-full" v-if="isFullScreen">
    <fu-full-screen-user v-if="fullScreenMode === 'user'" />
    <fu-external-video v-if="fullScreenMode === 'video'" />
  </section>

  <!-- <section class="m-full__tag" v-if="fullScreenObject && !isFullScreen">
    <span> El usuario esta fijado</span>
  </section> -->
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
    const { fullScreenMode, isFullScreen,fullScreenObject } = useToogleFunctions();
    return {
      fullScreenMode,
      isFullScreen,
      fullScreenObject,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
