<template>
  <q-card class="a-hand">
    <q-icon name="pan_tool" size="20px" color="white" />
    <label class="a-hand__message"
      >{{ functionsOnMenuBar.handNotificationInfo.streamName }} levantó la
      mano</label
    >
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuHandNotification',
  setup() {
    const { functionsOnMenuBar } = useToogleFunctions();
    return {
      functionsOnMenuBar,
    };
  },
});
</script>

<style scoped lang="scss">
@import './handNotification.scss';
</style>
