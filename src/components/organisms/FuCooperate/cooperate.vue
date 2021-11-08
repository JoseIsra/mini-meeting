<template>
  <section
    class="o-cooperate"
    v-on="{ mousemove: !screenMinimized ? toogleMenuBar : null }"
    v-touch:tap="toogleMenuBar"
    @click.self="closePanels"
    :style="`
      background: url('${bgInfo.url}') #36393f;
      background-size: ${bgInfo.maximized ? 100 : 50}vw;
      background-position: 50% center;
      background-repeat: no-repeat;
    `"
  >
    <!-- <q-img
      class="o-cooperate__background"
      :src="bgInfo.url"
      :style="bgStyle"
      :fit="bgInfo.maximized ? 'fill' : 'cover'"
    /> -->

    <q-icon
      name="fas fa-expand-alt"
      size="24px"
      class="o-cooperate__expand"
      @click="updateScreenState"
      v-show="screenMinimized"
    />
    <fu-cooperate-header
      v-show="!screenMinimized && $q.screen.lt.md ? showHeader : true"
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
    <fu-cooperate-user-video
      v-show="
        !screenMinimized && $q.screen.lt.md
          ? showUsersVideoList
          : !screenMinimized
      "
    />
    <fu-hand-notification
      v-show="
        functionsOnMenuBar.handNotificationInfo.length > 0 && !screenMinimized
      "
    />

    <fu-full-screen v-if="mainViewState.mode !== MAIN_VIEW_MODE.NONE" />

    <q-dialog
      v-model="showParticipantPanel"
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <fu-cooperate-participants-panel />
    </q-dialog>
  </section>
</template>
//TODO: OBJETO DE USUARIO GLOBAL
<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'molecules/FuCooperateHeader';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import FuFullScreen from 'molecules/FuFullScreen';
import FuCooperateParticipantsPanel from '@/components/molecules/FuCooperateParticipantsPanel';
import _ from 'lodash';
import { useSidebarToogle, useToogleFunctions } from '@/composables';
import { useScreen } from '@/composables/screen';
import { useRoom } from '@/composables/room';
import { useMainView } from '@/composables/mainView';
import { MAIN_VIEW_MODE } from '@/utils/enums';

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
    FuCooperateParticipantsPanel,
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted');
      window.addEventListener('orientationchange', handleOrientationChange);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    });

    let showMenuBar = ref<boolean>(false);
    let showUsersVideoList = ref<boolean>(false);
    const showHeader = ref<boolean>(true);

    let { isSidebarRender, setSidebarState, showParticipantPanel } =
      useSidebarToogle();

    const {
      functionsOnMenuBar,
      openOptionsMenu,
      openFunctionResponsiveMenu,
      setShowChat,
    } = useToogleFunctions();

    const { mainViewState } = useMainView();

    const { roomState } = useRoom();

    const { screenMinimized, updateScreenState, setScreenDeviceOrientation } =
      useScreen();

    const hideMenuBar = _.debounce(() => {
      showMenuBar.value = false;
      showUsersVideoList.value = false;
      showHeader.value = false;
    }, 5000);

    watch(
      () => screenMinimized.value,
      (value) => {
        if (value) {
          hideMenuBar.cancel();
        }
      }
    );
    const toogleMenuBar = () => {
      if (!showMenuBar.value) {
        showMenuBar.value = true;
        showUsersVideoList.value = true;
        showHeader.value = true;
      } else {
        hideMenuBar();
      }
    };

    const closePanels = () => {
      setSidebarState(false);
      openOptionsMenu(false);
      openFunctionResponsiveMenu(false);
      setShowChat(false);
    };

    const handleOrientationChange = () => {
      const orientation = window.screen.orientation.type;
      if (orientation == 'landscape-primary') {
        setScreenDeviceOrientation(true);
      } else if (orientation == 'portrait-primary') {
        setScreenDeviceOrientation(false);
      }
    };

    return {
      toogleMenuBar,
      showMenuBar,
      ...toRefs(props),
      isSidebarRender,
      functionsOnMenuBar,
      closePanels,
      screenMinimized,
      updateScreenState,
      ...toRefs(roomState),
      showParticipantPanel,
      showUsersVideoList,
      mainViewState,
      MAIN_VIEW_MODE,
      showHeader,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
