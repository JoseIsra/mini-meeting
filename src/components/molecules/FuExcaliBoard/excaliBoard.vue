<template>
  <section>
    <iframe
      src="https://excalidraw.com/"
      style="width: 600px; height: 200px"
      allow="autoplay; fullscreen"
      allowfullscreen
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuExcaliBoard',
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './excaliBoard.scss';
</style>
