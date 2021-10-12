<template>
  <section class="m-fuser">
    <div v-show="!studentPinned.isVideoActivated" class="m-fuser__avatar">
      <figure class="m-fuser__avatar__imageBox">
        <img
          class="m-fuser__avatar__imageBox__image"
          :src="studentPinned.avatar"
        />
      </figure>
      <div class="m-fuser__info">
        <label class="m-fuser__info__userName">{{ studentPinned.name }}</label>
      </div>
      <div class="m-fuser__actions">
        <q-btn
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
      label="Minimizar pantalla"
      class="m-fuser__quitBtn"
      icon="fullscreen_exit"
      @click="exitFullScreen"
      v-show="
        showMinimizeMessage &&
        studentPinned.isVideoActivated &&
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
import { useUserMe } from '@/composables/userMe';
import { useHandleParticipants } from '@/composables/participants';

export default defineComponent({
  name: 'FuFullScreenUser',
  setup() {
    const { fullScreenObject, setFullScreen, clearFullScreenObject } =
      useToogleFunctions();
    const { screenMinimized } = useScreen();
    let showMinimizeMessage = ref(false);
    let orientationClass = ref('');
    const { userMe } = useUserMe();
    const { admittedParticipants } = useHandleParticipants();

    const exitFullScreen = () => {
      setFullScreen('none');
      clearFullScreenObject();
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
    const studentPinned = computed(() => {
      if (userMe.id == fullScreenObject.id) {
        return userMe;
      } else {
        return admittedParticipants.value.find(
          (participant) => participant.id == fullScreenObject.id
        );
      }
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
      studentPinned,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUser.scss';
</style>
