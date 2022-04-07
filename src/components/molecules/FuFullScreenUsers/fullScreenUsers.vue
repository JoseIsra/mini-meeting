<template>
  <section :class="['m-fusers', usersDistributionStyle, layoutStyle]">
    <fu-full-screen-user
      :class="[
        'm-fusers__user',
        {
          '--thirdAndOdd':
            mainViewState.pinnedUsers.indexOf(pinnedUserId) == 2 &&
            mainViewState.pinnedUsers.length == 3,
        },
      ]"
      v-for="pinnedUserId in mainViewState.pinnedUsers"
      :key="pinnedUserId"
      :userId="pinnedUserId"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useMainView, useScreen, useUserMe } from '@/composables';
import FuFullScreenUser from '@/components/molecules/FuFullScreenUser';
import { useLayout } from '@/composables/layout';
import { LAYOUT } from '@/utils/enums/general';

export default defineComponent({
  name: 'FuFullScreenUsers',
  components: {
    FuFullScreenUser,
  },
  props: {
    userId: String,
  },
  setup() {
    const { mainViewState } = useMainView();
    const { screenMinimized } = useScreen();
    const { userMe } = useUserMe();
    const { layout } = useLayout();

    const buttonMinimizeSpecialStyle = ref(false);

    const usersDistributionStyle = computed(
      () => `--${mainViewState.pinnedUsers.length}users`
    );

    const layoutStyle = computed(() => ({
      '--split': layout.value == LAYOUT.DEFAULT_LAYOUT,
    }));

    return {
      screenMinimized,
      buttonMinimizeSpecialStyle,
      userMe,
      mainViewState,
      usersDistributionStyle,
      layoutStyle,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreenUsers.scss';
</style>
