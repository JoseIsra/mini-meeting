<template>
  <section class="m-full" @click.self="closePanels">
    <fu-full-screen-users
      v-if="
        mainViewState.mode === MAIN_VIEW_MODE.USER &&
        mainViewState.pinnedUsers.length > 0
      "
    />
    <fu-external-video v-if="mainViewState.mode === MAIN_VIEW_MODE.VIDEO" />
    <fu-board v-if="mainViewState.mode === MAIN_VIEW_MODE.BOARD" />
    <fu-excali-board v-if="mainViewState.mode === MAIN_VIEW_MODE.EXCALI" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  useMainView,
  useSidebarToogle,
  useToogleFunctions,
} from '@/composables';
import FuFullScreenUsers from 'molecules/FuFullScreenUsers';
import FuExternalVideo from 'molecules/FuExternalVideo';
import FuBoard from 'molecules/FuCooperateBoard';
import FuExcaliBoard from 'molecules/FuExcaliBoard';

import { MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuFullScreen',
  components: {
    FuFullScreenUsers,
    FuExternalVideo,
    FuBoard,
    FuExcaliBoard,
  },
  setup() {
    const { mainViewState } = useMainView();

    const { isSidebarRender, setSidebarState } = useSidebarToogle();

    const { openOptionsMenu, openFunctionResponsiveMenu, setShowChat } =
      useToogleFunctions();

    const closePanels = () => {
      if (isSidebarRender.value) {
        setSidebarState(false);
        openOptionsMenu(false);
        openFunctionResponsiveMenu(false);
        setShowChat(false);
      }
    };

    return {
      mainViewState,
      MAIN_VIEW_MODE,
      closePanels,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
