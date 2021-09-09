<template>
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
      <q-btn
        flat
        round
        :ripple="false"
        icon="launch"
        color="white"
        class="a-userVideo__box__avatar__screenBtn"
        @click="goFullScreen('nada')"
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="a-userVideo__box__avatar__screenBtn__label"
            >Pantalla completa</label
          >
        </q-tooltip>
      </q-btn>
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
      <q-btn
        flat
        round
        :ripple="false"
        icon="launch"
        color="white"
        class="a-userVideo__box__avatar__screenBtn"
        @click="goFullScreen(object)"
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="a-userVideo__box__avatar__screenBtn__label"
            >Pantalla completa</label
          >
        </q-tooltip>
      </q-btn>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { userStreams } from '@/helpers/usersVideo';
// import { objWebRTC } from '@/types';
import { usePerifericsControls, useToogleFunctions } from '@/composables';
import { useUserMe } from '@/composables/userMe';
import { useHandleParticipants } from '@/composables/ant-media-server-stuff';

interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const users = ref<UserStream[]>(userStreams);
    let { perifericsControl } = usePerifericsControls();
    const { objStreams } = useHandleParticipants();
    const { isFullScreen, setFullScreen } = useToogleFunctions();
    const { userMe } = useUserMe();

    const goFullScreen = (arg?: unknown) => {
      //TODO: PASAR ARGUMENTO DE OBJETO STREAM PARA ESPECIFICAR FULL SCREEN
      // setFullScreen(true);
      if (arg == 'nada') {
        console.log('nada');
      } else {
        console.log(arg);
      }
    };

    return {
      users,
      perifericsControl,
      userMe,
      goFullScreen,
      isFullScreen,
      objStreams,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
