<template>
  <section :class="['m-excali', layoutStyle, excaliStyle]">
    <iframe class="m-excali__board" src="https://excalidraw.com/" />
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLayout } from '@/composables/layout';
import { LAYOUT } from '@/utils/enums';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'FuExcaliBoard',
  setup() {
    const { layout } = useLayout();
    const $q = useQuasar();

    const layoutStyle = computed(() => ({
      '--presentation': layout.value == LAYOUT.PRESENTATION_LAYOUT,
    }));

    const excaliStyle = computed(() => {
      return {
        '--mobile': $q.screen.lt.md,
      };
    });

    return {
      layoutStyle,
      excaliStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './excaliBoard.scss';
</style>
