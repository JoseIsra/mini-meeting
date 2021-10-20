<template>
  <section
    class="a-userVideo"
    :style="styleOnMobile"
    :class="{ fade: screenMinimized }"
  >
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

      <div v-show="userMe.isVideoActivated">
        <div class="a-userVideo__box__avatar__info__userName --video">
          {{ userMe.name }}
        </div>
      </div>

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

      <div v-show="participant.isVideoActivated">
        <div class="a-userVideo__box__avatar__info__userName --video">
          {{ participant.name }}
        </div>
      </div>

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
    <!--  -->
    <div
      class="a-userVideo__more"
      v-show="
        $q.screen.lt.md
          ? admittedParticipants.length > 1
          : admittedParticipants.length > 5
      "
    >
      +{{
        $q.screen.lt.md
          ? admittedParticipants.length - 1
          : admittedParticipants.length - 5
      }}
    </div>
    <div
      v-for="(participant, index) in $q.screen.lt.md
        ? admittedParticipants.slice(0, -1)
        : admittedParticipants.slice(0, -5)"
      :key="index"
    >
      <video
        :srcObject.prop="participant.stream"
        :style="{ display: 'none' }"
        autoplay
        playsinline
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useToogleFunctions } from '@/composables';
import { User, useUserMe } from '@/composables/userMe';
import { useHandleParticipants } from '@/composables/participants';
import { useQuasar } from 'quasar';
import { useScreen } from '@/composables/screen';

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
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
    const { screenMinimized } = useScreen();

    const goFullScreen = (arg: User | string) => {
      if (isFullScreen.value) {
        setFullScreenObject(arg as User);
        return;
      }
      setFullScreen('user', true);
      setFullScreenObject(arg as User);
    };

    const controlUserToRender = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(-1)
        : admittedParticipants.value.slice(-5);
    });

    const styleOnMobile = computed(() => {
      return admittedParticipants.value.length > 5
        ? { 'justify-content': 'center' }
        : '';
    });

    return {
      userMe,
      goFullScreen,
      admittedParticipants,
      streamIdPinned,
      fullScreenObject,
      controlUserToRender,
      styleOnMobile,
      screenMinimized,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
