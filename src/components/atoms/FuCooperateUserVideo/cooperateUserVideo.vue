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
    <div
      class="a-userVideo__box"
      v-for="object in objStreams"
      :key="object.streamId"
    >
      <video
        class="a-userVideo__box__stream"
        autoplay
        controls
        playsinline
        :srcObject.prop="object.stream"
      ></video>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { userStreams } from '@/helpers/usersVideo';
import { objWebRTC } from '@/types';

interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperateUserVideo',
  props: {
    objStreams: {
      type: Array as PropType<objWebRTC[]>,
    },
  },
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
