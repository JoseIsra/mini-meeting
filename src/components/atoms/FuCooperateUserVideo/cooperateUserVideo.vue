<template>
  <section class="a-userVideo">
    <div class="a-userVideo__box">
      <video
        id="localVideo"
        class="a-userVideo__box__stream"
        autoplay
        muted
        controls
        playsinline
      ></video>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { userStreams } from '@/helpers/usersVideo';

interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const users = ref<UserStream[]>(userStreams);
    return {
      users,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
