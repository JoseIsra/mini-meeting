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

    <fu-board v-if="boardState" />

    <fu-full-screen v-if="isFullScreen" />

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
import FuBoard from '@/components/molecules/FuCooperateBoard';
import FuFullScreen from 'molecules/FuFullScreen';
import FuCooperateParticipantsPanel from '@/components/molecules/FuCooperateParticipantsPanel';
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
    FuBoard,
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

    let { isSidebarRender, setSidebarState, showParticipantPanel } =
      useSidebarToogle();

    const {
      functionsOnMenuBar,
      isFullScreen,
      setIDButtonSelected,
      openOptionsMenu,
      openFunctionResponsiveMenu,
    } = useToogleFunctions();

    const { roomState } = useRoom();

    const { screenMinimized, updateScreenState, setScreenDeviceOrientation } =
      useScreen();

    // Dynamig-bg update (to delete)
    // const bgStyle = computed(() => {
    //   return roomState.bgMaximixed
    //     ? 'left: 0; right: 0; top: 0; bottom: 0; width: 100vw; height: 100vh'
    //     : 'top: 25vh; width: 50vw; height: 50vh';
    // });

    const hideMenuBar = _.debounce(() => {
      showMenuBar.value = false;
      showUsersVideoList.value = false;
    }, 6000);

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
      isFullScreen,
      closePanels,
      screenMinimized,
      updateScreenState,
      ...toRefs(roomState),
      showParticipantPanel,
      showUsersVideoList,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
