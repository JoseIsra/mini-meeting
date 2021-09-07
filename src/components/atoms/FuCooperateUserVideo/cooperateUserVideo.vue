<template>
  <!-- :class="{ 'a-userVideo__box__avatar': perifericsControl.isCameraOn }" -->
  <section class="a-userVideo">
    <div class="a-userVideo__box">
      <div
        v-show="!perifericsControl.isVideoActivated"
        class="a-userVideo__box__avatar"
      >
        <figure class="a-userVideo__box__avatar__imageBox">
          <img
            class="a-userVideo__box__avatar__image"
            src="https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg"
          />
        </figure>
        <div class="a-userVideo__box__avatar__info">
          <label class="a-userVideo__box__avatar__info__userName">User</label>
          <q-icon
            :name="perifericsControl.isMicOn ? 'mic' : 'mic_off'"
            size="20px"
            color="white"
          />
        </div>
      </div>
      <video
        v-show="perifericsControl.isVideoActivated"
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
import { usePerifericsControls } from '@/composables';

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
