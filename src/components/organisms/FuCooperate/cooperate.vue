<template>
  <section class="o-cooperate" @mousemove="toogleMenuBar" @click.self="test">
    <q-icon
      name="fas fa-expand-alt"
      size="24px"
      class="o-cooperate__expand"
      @click="updateScreenState"
      v-show="screenMinimized"
    />

    <fu-cooperate-header v-show="!screenMinimized" />
    <fu-cooperate-menu-bar
      v-show="showMenuBar && !screenMinimized"
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :toggleDesktopCapture="toggleDesktopCapture"
    />
    <transition name="slide">
      <fu-cooperate-side-bar v-show="isSidebarRender" />
    </transition>
    <fu-cooperate-user-video />

    <fu-hand-notification
      v-show="functionsOnMenuBar.handNotificationInfo.length > 0"
    />
    <fu-full-screen v-if="isFullScreen" />
  </section>
</template>
//TODO: OBJETO DE USUARIO GLOBAL
<script lang="ts">
import { defineComponent, ref, toRefs, onMounted } from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'molecules/FuCooperateHeader';
// import FuCooperateBody from 'molecules/FuCooperateBody';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import FuFullScreen from 'atoms/FuFullScreen';
import _ from 'lodash';
import { useSidebarToogle, useToogleFunctions } from '@/composables';
import { useScreen } from '@/composables/screen';

export default defineComponent({
  name: 'FuCooperate',
  props: {
    toggleLocalCamera: {
      type: Function,
    },
    toggleLocalMic: {
      type: Function,
    },
    toggleDesktopCapture: {
      type: Function,
    },
  },
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateSideBar,
    FuCooperateUserVideo,
    FuHandNotification,
    FuFullScreen,
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted');
    });

    let showMenuBar = ref<boolean>(false);
    let { isSidebarRender, setSidebarState } = useSidebarToogle();
    const { functionsOnMenuBar, isFullScreen, setIDButtonSelected } =
      useToogleFunctions();

    const { screenMinimized, updateScreenState } = useScreen();

    const hideMenuBar = _.debounce(() => {
      showMenuBar.value = false;
    }, 6000);

    const toogleMenuBar = () => {
      if (!showMenuBar.value) {
        showMenuBar.value = true;
      } else {
        hideMenuBar();
      }
    };
    const test = () => {
      setSidebarState(false);
      setIDButtonSelected('');
    };
    return {
      toogleMenuBar,
      showMenuBar,
      ...toRefs(props),
      isSidebarRender,
      functionsOnMenuBar,
      isFullScreen,
      test,
      screenMinimized,
      updateScreenState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
