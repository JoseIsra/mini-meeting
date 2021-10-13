<template>
  <section class="a-userVideo" :style="styleOnMobile">
    <div
      class="a-userVideo__box"
      :class="{ fade: fullScreenObject.id == userMe.id }"
    >
      <div v-show="!userMe.isVideoActivated" class="a-userVideo__box__avatar">
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
          <q-icon :name="userMe.isMicOn ? 'mic' : 'mic_off'" color="white" />
        </div>
      </div>
      <video
        :srcObject.prop="userMe.stream"
        v-show="userMe.isVideoActivated"
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
        @click="goFullScreen(userMe)"
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
      v-for="participant in controlUserToRender"
      :key="participant.id"
      :class="{ fade: fullScreenObject.id == participant.id }"
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
        icon="launch"
        color="white"
        class="a-userVideo__box__avatar__screenBtn"
        @click="goFullScreen(participant)"
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
import { defineComponent, ref, computed } from 'vue';
import { userStreams } from '@/helpers/usersVideo';
import { useToogleFunctions } from '@/composables';
import { User, useUserMe } from '@/composables/userMe';
import { useHandleParticipants } from '@/composables/participants';
import { useQuasar } from 'quasar';

interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const users = ref<UserStream[]>(userStreams);
    const { admittedParticipants } = useHandleParticipants();

    const {
      setFullScreen,
      setFullScreenObject,
      fullScreenObject,
      isFullScreen,
    } = useToogleFunctions();
    const { userMe } = useUserMe();

    const streamIdPinned = ref('');
    const $q = useQuasar();

    const goFullScreen = (arg: User | string) => {
      if (isFullScreen.value) {
        setFullScreenObject(arg as User);
        return;
      }
      setFullScreen('user');
      setFullScreenObject(arg as User);
    };

    const controlUserToRender = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(-1)
        : admittedParticipants.value.slice(-9);
    });

    const styleOnMobile = computed(() => {
      return admittedParticipants.value.length > 5
        ? { 'justify-content': 'center' }
        : '';
    });

    return {
      users,
      userMe,
      goFullScreen,
      admittedParticipants,
      streamIdPinned,
      fullScreenObject,
      controlUserToRender,
      styleOnMobile,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
