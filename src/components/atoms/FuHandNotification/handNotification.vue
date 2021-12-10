<template>
  <section class="a-hand" :style="handOrigin">
    <div
      class="a-hand__content"
      v-for="notification in functionsOnMenuBar.handNotificationInfo"
      :key="notification.id"
    >
      <fu-notification-info :notification="notification" />
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useToogleFunctions, useScreen } from '@/composables';
import FuNotificationInfo from 'atoms/FuHandNotificationInfo';
import { useQuasar } from 'quasar';
export default defineComponent({
  name: 'FuHandNotification',
  components: { FuNotificationInfo },
  setup() {
    const { functionsOnMenuBar } = useToogleFunctions();
    const { screenMinimized } = useScreen();
    const $q = useQuasar();

    const handOrigin = computed(() => {
      return $q.screen.lt.sm
        ? {
            bottom: 0,
          }
        : {
            top: 0,
            right: 0,
          };
    });

    return {
      functionsOnMenuBar,
      screenMinimized,
      handOrigin,
    };
  },
});
</script>

<style scoped lang="scss">
@import './handNotification.scss';
</style>
