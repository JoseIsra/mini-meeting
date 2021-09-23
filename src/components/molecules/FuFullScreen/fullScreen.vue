<template>
  <section class="m-full">
    <fu-full-screen-user v-if="fullScreenMode === 'user'" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuFullScreenUser from 'molecules/FuFullScreenUser';
import { useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuFullScreen',
  components: { FuFullScreenUser },
  setup() {
    const { fullScreenMode } = useToogleFunctions();
    return {
      fullScreenMode,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
