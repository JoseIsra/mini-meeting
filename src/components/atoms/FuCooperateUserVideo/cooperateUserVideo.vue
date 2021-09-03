<template>
  <section class="a-userVideo">
    <div
      class="a-userVideo__box"
      :class="{ 'a-userVideo__box__avatar': perifericsControl.isCameraOn }"
    >
      <!-- <figure
        v-show="perifericsControl.isCameraOn"
        class="a-userVideo__box__avatar"
      >
        <img
          class="a-userVideo__box__avatar__image"
          src="https://cdn.quasar.dev/img/boy-avatar.png"
        />
      </figure> -->
      <video
        v-show="!perifericsControl.isCameraOn"
        id="localVideo"
        class="a-userVideo__box__stream"
        autoplay
        muted
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
import { usePerifericsControls } from '@/componsables';

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
    let { perifericsControl } = usePerifericsControls();
    return {
      users,
      perifericsControl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
