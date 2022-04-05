<template>
  <section
    class="o-cooperate"
    v-on="{ mousemove: !screenMinimized ? toogleMenuBar : null }"
    v-touch:tap="toogleMenuBar"
    @click.self="closePanels"
    :style="[
      `
      background: url('${bgInfo.url}') #36393f;
      background-size: ${bgInfo.maximized ? 100 : 50}vw;
      background-position: 50% center;
      background-repeat: no-repeat;
    `,
      heightObjectStyle,
    ]"
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

    <fu-cooperate-menu-bar v-show="showMenuBar && !screenMinimized" />
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
    <fu-hand-notification v-show="handActives && !screenMinimized" />
    <fu-full-screen v-if="mainViewState.mode !== MAIN_VIEW_MODE.NONE" />

    <!-- solicitudes -->
    <q-dialog
      v-model="showParticipantPanel"
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <fu-cooperate-participants-panel />
    </q-dialog>
    <fu-warning v-model="openTabSharedWarning" />
  </section>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'molecules/FuCooperateHeader';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import FuFullScreen from 'molecules/FuFullScreen';
import FuWarning from 'atoms/FuWarning';
import FuCooperateParticipantsPanel from '@/components/molecules/FuCooperateParticipantsPanel';
import _ from 'lodash';
import {
  useRoom,
  useScreen,
  useToogleFunctions,
  useSidebarToogle,
  useMainView,
  useHandleParticipants,
  useHandleMessage,
} from '@/composables';
import { usePanels } from '@/composables/panels';
import { MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuCooperate',
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateSideBar,
    FuCooperateUserVideo,
    FuHandNotification,
    FuFullScreen,
    FuCooperateParticipantsPanel,
    FuWarning,
  },
  setup(props, { emit }) {
    let vh = ref(window.innerHeight * 0.01);
    const { participantVideoTracks, participantAudioTracks } =
      useHandleParticipants();
    const { acumulateMessages } = useHandleMessage();
    const { openTabSharedWarning } = usePanels();

    onMounted(() => {
      emit('mounted');
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleDeviceHeight);
    });

    const handleDeviceHeight = () => {
      vh.value = window.innerHeight * 0.01;
    };

    const heightObjectStyle = computed(() => ({
      '--vh': String(vh.value) + 'px',
    }));

    onBeforeUnmount(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleDeviceHeight);
    });

    let showMenuBar = ref<boolean>(false);
    let showUsersVideoList = ref<boolean>(false);
    const showHeader = ref<boolean>(true);

    const { mainViewState } = useMainView();
    let { isSidebarRender, setSidebarState, showParticipantPanel } =
      useSidebarToogle();

    const {
      functionsOnMenuBar,
      openOptionsMenu,
      openFunctionResponsiveMenu,
      setShowChat,
    } = useToogleFunctions();

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
      if (functionsOnMenuBar.renderChat) {
        acumulateMessages(0);
      }
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

    const handActives = computed(() => {
      return functionsOnMenuBar.handNotificationInfo.length > 0;
    });

    return {
      toogleMenuBar,
      showMenuBar,
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
      heightObjectStyle,
      handActives,
      participantVideoTracks,
      participantAudioTracks,
      openTabSharedWarning,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
