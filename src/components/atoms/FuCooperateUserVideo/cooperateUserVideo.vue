<template>
  <section class="a-userVideo">
    <div
      class="a-userVideo__box"
      :class="{ full: userMe.id === streamIdPinned }"
    >
      <div
        v-show="!userMe.isVideoActivated"
        class="a-userVideo__box__avatar"
        :class="{ full__content: userMe.id === streamIdPinned }"
      >
        <figure
          class="a-userVideo__box__avatar__imageBox"
          :class="{ full__content__avatar: userMe.id === streamIdPinned }"
        >
          <img
            class="a-userVideo__box__avatar__imageBox__image"
            :src="userMe.avatar"
          />
        </figure>
        <div class="a-userVideo__box__avatar__info">
          <label
            class="a-userVideo__box__avatar__info__userName"
            :class="{ full__content__name: userMe.id === streamIdPinned }"
            >{{ userMe.name }}</label
          >
          <q-icon
            :name="userMe.isMicOn ? 'mic' : 'mic_off'"
            :size="userMe.id === streamIdPinned ? '40px' : '20px'"
            color="white"
          />
        </div>
      </div>
      <video
        v-show="userMe.isVideoActivated"
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
      <div
        v-show="!participant.isVideoActivated"
        class="a-userVideo__box__avatar"
      >
        <figure class="a-userVideo__box__avatar__imageBox">
          <img
            v-if="participant.avatar"
            class="a-userVideo__box__avatar__imageBox__image"
            :src="participant.avatar"
          />
          <q-spinner-oval
            v-if="!participant.avatar"
            color="primary"
            size="2em"
          />
        </figure>
        <div class="a-userVideo__box__avatar__info">
          <label class="a-userVideo__box__avatar__info__userName">{{
            participant.name
          }}</label>
          <q-icon
            :name="participant.isMicOn ? 'mic' : 'mic_off'"
            size="20px"
            color="white"
          />
        </div>
      </div>
      <video
        v-show="participant.isVideoActivated"
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
import { useToogleFunctions } from '@/composables';
import { useUserMe } from '@/composables/userMe';
import { useHandleParticipants } from '@/composables/participants';

interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const users = ref<UserStream[]>(userStreams);
    const { participants } = useHandleParticipants();
    const { isFullScreen } = useToogleFunctions();
    const { userMe } = useUserMe();

    const streamIdPinned = ref('');

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
