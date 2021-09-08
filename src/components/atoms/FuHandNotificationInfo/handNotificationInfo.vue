<template>
  <div class="a-notification" :class="{ faded: disappear }">
    <q-icon name="pan_tool" size="20px" color="white" />
    <label class="a-notification__message"
      >{{ notification.streamName }} levantó la mano</label
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, ref } from 'vue';
import { HandNotification } from '@/composables/index';

export default defineComponent({
  name: 'FuNotificationInfo',
  props: {
    notification: {
      type: Object as PropType<HandNotification>,
    },
  },
  setup() {
    let disappear = ref(false);

    onMounted(() => {
      setTimeout(() => {
        disappear.value = true;
      }, 5000);
    });
    return {
      disappear,
    };
  },
});
</script>

<style scoped lang="scss">
@import './handNotificationInfo.scss';
</style>
