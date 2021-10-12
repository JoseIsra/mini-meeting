<template>
  <section class="m-fuser">
    <div v-show="!fullScreenObject.isVideoActivated" class="m-fuser__avatar">
      <figure class="m-fuser__avatar__imageBox">
        <img
          class="m-fuser__avatar__imageBox__image"
          :src="fullScreenObject.avatar"
        />
      </figure>
      <div class="m-fuser__info">
        <label class="m-fuser__info__userName">{{
          fullScreenObject.name
        }}</label>
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
      v-show="fullScreenObject.isVideoActivated"
      :class="[
        'm-fuser__stream',
        orientationClass,
        { '--coverMode': hasCameraActivated },
      ]"
      autoplay
      @mousemove="toggleMinimizeMessage"
      muted
      playsinline
      :srcObject.prop="fullScreenObject.stream"
    ></video>
    <q-btn
      flat
      label="Minimizar pantalla"
      class="m-fuser__quitBtn"
      icon="fullscreen_exit"
      @click="exitFullScreen"
      v-show="
        showMinimizeMessage &&
        fullScreenObject.isVideoActivated &&
        !screenMinimized
      "
    />
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useToogleFunctions } from '@/composables';
import { useScreen } from '@/composables/screen';
import _ from 'lodash';
import { useRoom } from '@/composables/room';
import { useUserMe } from '@/composables/userMe';
import { useInitWebRTC } from '@/composables/antMedia';

export default defineComponent({
  name: 'FuFullScreenUser',
  setup() {
    const { fullScreenObject, setFullScreen, clearFullScreenObject } =
      useToogleFunctions();

    const { screenMinimized } = useScreen();

    const { updateFocus, roomState } = useRoom();

    const { userMe } = useUserMe();

    const canClose = computed(() => {
      if (!roomState.focused) {
        return true;
      } else if (!!roomState.focused && userMe.roleId !== 1) {
        return true;
      } else {
        return false;
      }
    });

    const { sendData } = useInitWebRTC();

    let showMinimizeMessage = ref(false);

    let orientationClass = ref('');

    const exitFullScreen = () => {
      setFullScreen('none');
      clearFullScreenObject();

      if (roomState.focused) {
        sendData(userMe.id, {
          eventType: 'SET_FULL_SCREEN',
          mode: 'none',
        });
      }

      updateFocus(null);
    };

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
      return fullScreenObject.isCameraOn;
    });

    onMounted(() => {
      window.addEventListener('orientationchange', handleOrientationChange);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    });

    const handleOrientationChange = () => {
      const orientation = window.screen.orientation.type;
      if (
        orientation == 'landscape-primary' &&
        fullScreenObject.isScreenSharing
      ) {
        orientationClass.value = 'landscapeMode';
      } else if (
        orientation == 'portrait-primary' &&
        fullScreenObject.isScreenSharing
      ) {
        orientationClass.value = 'portraitMode';
      }
    };

    return {
      handleOrientationChange,
      fullScreenObject,
      exitFullScreen,
      toggleMinimizeMessage,
      showMinimizeMessage,
      hasCameraActivated,
      orientationClass,
      screenMinimized,
      canClose,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUser.scss';
</style>
