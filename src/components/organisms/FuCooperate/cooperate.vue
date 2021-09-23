<template>
  <section
    class="o-cooperate"
    @mousemove="toogleMenuBar"
    @click.self="closePanels"
  >
    <q-icon
      name="fas fa-expand-alt"
      size="24px"
      class="o-cooperate__expand"
      @click="updateScreenState"
      v-show="screenMinimized"
    />
    <fu-cooperate-header v-show="!screenMinimized" />
    <fu-shared-stream
      :sharedLink="sharingLink"
      v-show="functionsOnMenuBar.renderInfoRoomCard"
    />
    <fu-cooperate-menu-bar
      v-show="showMenuBar && !screenMinimized"
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :toggleDesktopCapture="toggleDesktopCapture"
    />
    <transition :name="$q.screen.lt.sm ? 'dragged' : 'slide'">
      <fu-cooperate-side-bar v-show="isSidebarRender" />
    </transition>
    <fu-cooperate-user-video v-show="!screenMinimized" />
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
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import FuFullScreen from 'molecules/FuFullScreen';
import _ from 'lodash';
import { useSidebarToogle, useToogleFunctions } from '@/composables';
import { useScreen } from '@/composables/screen';
import FuSharedStream from 'molecules/FuSharedStream';
import { useRoom } from '@/composables/room';

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
    FuSharedStream,
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted');
    });

    let showMenuBar = ref<boolean>(false);
    let { isSidebarRender, setSidebarState } = useSidebarToogle();
    const {
      functionsOnMenuBar,
      isFullScreen,
      setIDButtonSelected,
      openOptionsMenu,
      openFunctionResponsiveMenu,
    } = useToogleFunctions();
    const { roomState } = useRoom();
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
    const closePanels = () => {
      setSidebarState(false);
      openOptionsMenu(false);
      openFunctionResponsiveMenu(false);
      setIDButtonSelected('');
    };
    return {
      toogleMenuBar,
      showMenuBar,
      ...toRefs(props),
      isSidebarRender,
      functionsOnMenuBar,
      isFullScreen,
      closePanels,
      screenMinimized,
      updateScreenState,
      ...toRefs(roomState),
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
