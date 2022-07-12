<template>
  <section
    class="o-cooperate"
    v-on="{ mousemove: !screenMinimized ? toogleMenuBar : null }"
    v-touch:tap="toogleMenuBar"
    :style="[bgRenderStyles, heightObjectStyle]"
    @click.self="closePanels"
  >
    <q-resize-observer @resize="onResize" />
    <q-icon
      name="fas fa-expand-alt"
      size="24px"
      class="o-cooperate__expand"
      @click="updateScreenState"
      v-show="screenMinimized"
    />

    <fu-cooperate-menu-bar v-show="showMenuBar && !screenMinimized" />
    <fu-cooperate-user-video
      v-show="
        !screenMinimized && $q.screen.lt.md
          ? showUsersVideoList
          : !screenMinimized
      "
    />
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
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import _ from 'lodash';
import {
  useRoom,
  useScreen,
  useToogleFunctions,
  useSidebarToogle,
  useMainView,
  useHandleParticipants,
} from '@/composables';
import { usePanels } from '@/composables/panels';
import { useLayout } from '@/composables/layout';
import { useBoard } from '@/composables/board';
import { LAYOUT, MAIN_VIEW_MODE } from '@/utils/enums';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuCooperate',
  components: {
    FuCooperateMenuBar,
    FuCooperateUserVideo,
  },
  setup(props, { emit }) {
    let vh = ref(window.innerHeight * 0.01);
    const { participantVideoTracks, participantAudioTracks } =
      useHandleParticipants();
    const { openTabSharedWarning } = usePanels();
    const { layout, setNewLayout } = useLayout();
    const $q = useQuasar();
    const { setShowExcaliBoard } = useBoard();

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
    let { isSidebarRender, showParticipantPanel, setSidebarState } =
      useSidebarToogle();

    const { functionsOnMenuBar, setShowChat } = useToogleFunctions();

    const { roomState } = useRoom();

    const {
      screenMinimized,
      updateScreenState,
      setScreenDeviceOrientation,
      isMobile,
    } = useScreen();

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

    watch(
      () => mainViewState.mode,
      (value) => {
        if (value !== 0 && isMobile()) {
          setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
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

    const handleOrientationChange = () => {
      const orientation = window.screen.orientation.type;
      if (orientation == 'landscape-primary') {
        setScreenDeviceOrientation(true);
      } else if (orientation == 'portrait-primary') {
        setScreenDeviceOrientation(false);
      }
    };

    const isPresentationLayout = computed(() => {
      return layout.value == LAYOUT.PRESENTATION_LAYOUT;
    });

    const renderHeader = computed(() => {
      return !screenMinimized.value &&
        $q.screen.lt.md &&
        layout.value == LAYOUT.PRESENTATION_LAYOUT
        ? showHeader.value
        : isPresentationLayout.value;
    });
    const bgRenderStyles = computed(() => {
      return isPresentationLayout.value
        ? {
            'background-image': `url(${roomState.bgInfo.url})`,
            'background-size': `${roomState.bgInfo.maximized ? 100 : 50}vw`,
            'background-position': ' 50% center',
            'background-repeat': 'no-repeat',
          }
        : '';
    });

    const onResize = (size: { height: number; width: number }) => {
      if (size.width < 1024) {
        setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
        setShowExcaliBoard(false);
      }
    };

    const closePanels = () => {
      setSidebarState(false);
      setShowChat(false);
    };
    return {
      toogleMenuBar,
      showMenuBar,
      isSidebarRender,
      functionsOnMenuBar,
      screenMinimized,
      updateScreenState,
      ...toRefs(roomState),
      showParticipantPanel,
      showUsersVideoList,
      mainViewState,
      MAIN_VIEW_MODE,
      showHeader,
      heightObjectStyle,
      participantVideoTracks,
      participantAudioTracks,
      openTabSharedWarning,
      renderHeader,
      bgRenderStyles,
      onResize,
      closePanels,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
