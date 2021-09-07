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
            class="a-userVideo__box__avatar__imageBox__image"
            :src="userMe.avatar"
          />
        </figure>
        <div class="a-userVideo__box__avatar__info">
          <label class="a-userVideo__box__avatar__info__userName">{{
            userMe.name
          }}</label>
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
import { useUserMe } from '@/composables/userMe';

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
    const { userMe } = useUserMe();
    return {
      users,
      perifericsControl,
      userMe,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
