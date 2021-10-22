<template>
  <section class="m-fuser">
    <template v-if="gotPinnedUser">
      <div v-show="!studentPinned.isVideoActivated" class="m-fuser__avatar">
        <figure class="m-fuser__avatar__imageBox">
          <img
            class="m-fuser__avatar__imageBox__image"
            :src="studentPinned.avatar"
          />
        </figure>
        <div class="m-fuser__info">
          <label class="m-fuser__info__userName"
            >{{ studentPinned.name }}
            {{ studentPinned.id === userMe.id ? '(Tú)' : '' }}</label
          >
        </div>
        <div class="m-fuser__actions">
          <q-btn
            v-if="canClose"
            @click="exitFullScreen"
            round
            flat
            icon="fullscreen_exit"
            color="white"
          >
            <q-tooltip
              class="bg-grey-10"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="m-fuser__actions__message"> Minimizar </label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <video
        v-show="studentPinned.isVideoActivated"
        :class="[
          'm-fuser__stream',
          orientationClass,
          { '--coverMode': hasCameraActivated },
        ]"
        autoplay
        @mousemove="toggleMinimizeMessage"
        muted
        playsinline
        :srcObject.prop="studentPinned.stream"
      ></video>
      <q-btn
        flat
        :label="buttonMinimizeSpecialStyle ? '' : 'Minimizar pantalla'"
        class="m-fuser__quitBtn"
        :class="{ '--cornerButton': buttonMinimizeSpecialStyle }"
        icon="fullscreen_exit"
        @click="exitFullScreen"
        v-show="
          showMinimizeMessage &&
          studentPinned.isVideoActivated &&
          !screenMinimized & minimizeOnGlobalFocusedUser
        "
      />
    </template>

    <div class="m-fuser__loading" v-else>
      <q-spinner color="primary" size="10em" />

      <q-btn
        class="m-fuser__loading__exit"
        @click="exitFullScreen"
        round
        flat
        icon="fullscreen_exit"
        color="white"
      >
        <q-tooltip
          class="bg-grey-10"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="m-fuser__actions__message"> Minimizar </label>
        </q-tooltip>
      </q-btn>

      <span> Cargando... </span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useToogleFunctions } from '@/composables';
import { useScreen } from '@/composables/screen';
import _ from 'lodash';
import { useRoom } from '@/composables/room';
import { User, useUserMe } from '@/composables/userMe';
import { useInitWebRTC } from '@/composables/antMedia';
import { useHandleParticipants } from '@/composables/participants';

export default defineComponent({
  name: 'FuFullScreenUser',
  setup() {
    const {
      fullScreenObject,
      setFullScreen,
      clearFullScreenObject,
      setFullScreenObject,
    } = useToogleFunctions();
    const { screenMinimized, isLandscape } = useScreen();
    const { updateFocus, roomState } = useRoom();
    const { userMe } = useUserMe();
    const { admittedParticipants } = useHandleParticipants();
    const { sendData } = useInitWebRTC();
    const gotPinnedUser = computed(() => !!fullScreenObject.id);
    const buttonMinimizeSpecialStyle = ref(false);

    watch(admittedParticipants, (value) => {
      if (!gotPinnedUser.value) {
        const participant = value.find((p) => p.id === roomState.pinnedUserId);
        setFullScreenObject(participant as User);
        updateFocus(participant as User);
      }
    });

    const canClose = computed(() => {
      if (!roomState.pinnedUser) {
        return true;
      } else if (!!roomState.pinnedUser && userMe.roleId !== 1) {
        return true;
      } else {
        return false;
      }
    });

    const exitFullScreen = () => {
      setFullScreen('none', false);
      clearFullScreenObject();

      if (userMe.roleId === 0 && roomState.pinnedUser) {
        console.log('Admin fullScreen task');

        sendData(roomState.hostId, {
          eventType: 'SET_FULL_SCREEN',
          mode: 'none',
        });

        updateFocus(null);
        window.xprops?.setPinnedUser?.('');
      }
    };

    let showMinimizeMessage = ref(false);

    let orientationClass = ref('');

    const hideMinimizeMessage = _.debounce(() => {
      showMinimizeMessage.value = false;
    }, 4000);

    const toggleMinimizeMessage = () => {
      if (!showMinimizeMessage.value) {
        showMinimizeMessage.value = true;
      } else {
        hideMinimizeMessage();
      }
    };

    const hasCameraActivated = computed(() => {
      return studentPinned?.value?.isCameraOn;
    });

    const studentPinned = computed(() => {
      if (userMe.id == fullScreenObject.id) {
        return userMe;
      } else {
        return admittedParticipants.value.find(
          (participant) => participant.id == fullScreenObject.id
        );
      }
    });

    watch(
      () => isLandscape.value,
      (value) => {
        if (value) {
          if (
            studentPinned.value?.isScreenSharing ||
            studentPinned.value?.isCameraOn
          ) {
            buttonMinimizeSpecialStyle.value = true;
            orientationClass.value = 'landscapeMode';
          }
        } else {
          buttonMinimizeSpecialStyle.value = false;
          if (studentPinned.value?.isScreenSharing) {
            orientationClass.value = 'portraitMode';
          }
        }
      },
      {
        immediate: true,
      }
    );

    const minimizeOnGlobalFocusedUser = computed(() => !roomState.pinnedUser);

    return {
      fullScreenObject,
      exitFullScreen,
      toggleMinimizeMessage,
      showMinimizeMessage,
      hasCameraActivated,
      orientationClass,
      screenMinimized,
      canClose,
      studentPinned,
      gotPinnedUser,
      buttonMinimizeSpecialStyle,
      minimizeOnGlobalFocusedUser,
      userMe,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUser.scss';
</style>
