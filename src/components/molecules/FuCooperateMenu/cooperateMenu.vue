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
    <fu-menu-content-options v-if="!isActions && !renderFunctions" />
    <fu-menu-content-functions v-if="renderFunctions && !isActions" />
    <q-icon
      :class="['a-cooperateMenu__tail', { '--specialcase': isActions }]"
      name="arrow_drop_down"
      size="50px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import FuMenuContentOptions from 'molecules/FuMenuContentOptions';
import FuMenuContentActions from 'molecules/FuMenuContentActions';
import FuMenuContentFunctions from 'molecules/FuMenuContentFunctions';

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
