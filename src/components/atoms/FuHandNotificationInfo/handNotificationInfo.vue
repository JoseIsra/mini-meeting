<template>
  <div
    class="a-notification"
    :class="{ faded: disappear }"
    :style="handBackground"
  >
    <q-icon name="pan_tool" size="20px" color="white" />
    <label class="a-notification__message"
      >{{ notification.streamName }} levantó la mano</label
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, ref, computed } from 'vue';
import { HandNotification } from '@/types';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuNotificationInfo',
  props: {
    notification: {
      type: Object as PropType<HandNotification>,
    },
  },
  setup() {
    let disappear = ref(false);
    const $q = useQuasar();

    onMounted(() => {
      setTimeout(() => {
        disappear.value = true;
      }, 5000);
    });

    const handBackground = computed(() => {
      return $q.screen.lt.sm
        ? {
            backgroundColor: 'black',
          }
        : {
            backgroundColor: 'rgba(0,0,0,.4)',
          };
    });

    return {
      disappear,
      handBackground,
    };
  },
});
</script>

<style scoped lang="scss">
@import './handNotificationInfo.scss';
</style>
