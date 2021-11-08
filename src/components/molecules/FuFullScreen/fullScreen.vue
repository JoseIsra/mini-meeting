<template>
  <section class="m-full">
    <fu-full-screen-users
      v-if="
        mainViewState.mode === MAIN_VIEW_MODE.USER &&
        mainViewState.pinnedUsers.length > 0
      "
    />
    <fu-external-video v-if="mainViewState.mode === MAIN_VIEW_MODE.VIDEO" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuFullScreenUsers from 'molecules/FuFullScreenUsers';
import FuExternalVideo from 'molecules/FuExternalVideo';
import { useMainView } from '@/composables/mainView';
import { MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuFullScreen',
  components: { FuFullScreenUsers, FuExternalVideo },
  setup() {
    const { mainViewState } = useMainView();
    return {
      mainViewState,
      MAIN_VIEW_MODE,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
