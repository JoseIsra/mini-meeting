<template>
  <section class="a-userVideo">
    <div
      class="a-userVideo__box"
      :style="
        userMe.id === streamIdPinned
          ? {
              position: 'fixed',
              width: '100vw',
              height: '100vh',
              top: 0,
              'z-index': '-5',
            }
          : ''
      "
    >
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
        :icon="userMe.id === streamIdPinned ? 'fullscreen_exit' : 'launch'"
        color="white"
        class="a-userVideo__box__avatar__screenBtn"
        @click="
          userMe.id === streamIdPinned
            ? goFullScreen('off')
            : goFullScreen(userMe.id)
        "
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="a-userVideo__box__avatar__screenBtn__label">{{
            userMe.id === streamIdPinned ? 'Minimizar' : 'Pantalla completa'
          }}</label>
        </q-tooltip>
      </q-btn>
    </div>
    <div
      class="a-userVideo__box"
      v-for="participant in participants"
      :key="participant.id"
      :style="
        participant.id === streamIdPinned
          ? {
              position: 'fixed',
              width: '100vw',
              height: '100vh',
              top: 0,
              'z-index': '-5',
            }
          : ''
      "
    >
      <video
        class="a-userVideo__box__stream"
        autoplay
        playsinline
        :srcObject.prop="participant.stream"
      ></video>
      <q-btn
        flat
        round
        :ripple="false"
        :icon="participant.id === streamIdPinned ? 'fullscreen_exit' : 'launch'"
        color="white"
        class="a-userVideo__box__avatar__screenBtn"
        @click="
          participant.id === streamIdPinned
            ? goFullScreen('off')
            : goFullScreen(participant.id)
        "
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="a-userVideo__box__avatar__screenBtn__label">{{
            participant.id === streamIdPinned
              ? 'Minimizar'
              : 'Pantalla completa'
          }}</label>
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
    const { participants } = useHandleParticipants();
    const { isFullScreen, setFullScreen } = useToogleFunctions();
    const { userMe } = useUserMe();

    const streamIdPinned = ref('');

    /* const setUserPinned = (streamId: string) => {
      userPinned.value = streamId;
    }; */

    const goFullScreen = (streamId: string) => {
      //TODO: PASAR ARGUMENTO DE OBJETO STREAM PARA ESPECIFICAR FULL SCREEN
      //setFullScreen(true);
      console.log(streamId);
      if (streamId === 'off') streamIdPinned.value = '';
      else {
        streamIdPinned.value = streamId;
      }
    };

    return {
      users,
      perifericsControl,
      userMe,
      goFullScreen,
      isFullScreen,
      participants,
      streamIdPinned,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
