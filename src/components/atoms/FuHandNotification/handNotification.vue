<template>
  <section class="a-hand">
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
import { defineComponent } from 'vue';
import { useToogleFunctions } from '@/composables';
import FuNotificationInfo from 'atoms/FuHandNotificationInfo';
import { useScreen } from '@/composables/screen';
export default defineComponent({
  name: 'FuHandNotification',
  components: { FuNotificationInfo },
  setup() {
    const { functionsOnMenuBar } = useToogleFunctions();
    const { screenMinimized } = useScreen();
    return {
      functionsOnMenuBar,
      screenMinimized,
    };
  },
});
</script>

<style scoped lang="scss">
@import './handNotification.scss';
</style>
