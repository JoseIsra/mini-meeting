<template>
  <div
    :class="[
      'a-cooperateMenu',
      { '--actions': isActions },
      { '--options': !isActions && !renderFunctions },
      { '--functions': renderFunctions && !isActions },
    ]"
  >
    <fu-menu-content-actions v-if="isActions" />
    <fu-menu-content-options
      v-if="!isActions && !renderFunctions"
      :webRTCAdaptor="webRTCAdaptor"
    />
    <fu-menu-content-functions v-if="renderFunctions && !isActions" />
    <q-icon
      :class="['a-cooperateMenu__tail', { '--specialcase': isActions }]"
      name="arrow_drop_down"
      size="50px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, PropType } from 'vue';
import FuMenuContentOptions from 'molecules/FuMenuContentOptions';
import FuMenuContentActions from 'molecules/FuMenuContentActions';
import FuMenuContentFunctions from 'molecules/FuMenuContentFunctions';
import { WebRTCAdaptorType } from '@/types';

export default defineComponent({
  name: 'FuCooperateMenu',
  components: {
    FuMenuContentOptions,
    FuMenuContentActions,
    FuMenuContentFunctions,
  },
  props: {
    isActions: {
      type: Boolean,
    },
    renderFunctions: {
      type: Boolean,
    },
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenu.scss';
</style>
