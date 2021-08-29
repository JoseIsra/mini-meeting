<template>
  <div class="a-userVideo">
    <video
      class="a-userVideo__video"
      src="https://www.youtube.com/watch?v=g_BBc7zXEts"
      controls
      autoplay
    ></video>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperateUserVideo',
  // setup() {
  //   return {
  //   };
  // },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
