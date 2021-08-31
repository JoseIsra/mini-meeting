<template>
  <div class="a-cooperateMenu">
    <fu-menu-content-actions v-if="isActions" />
    <fu-menu-content-options v-else />
    <q-icon
      :class="['a-cooperateMenu__tail', { '--specialcase': isActions }]"
      name="arrow_drop_down"
      size="50px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import FuMenuContentOptions from 'atoms/FuMenuContentOptions';
import FuMenuContentActions from 'atoms/FuMenuContentActions';

export default defineComponent({
  name: 'FuCooperateMenu',
  components: { FuMenuContentOptions, FuMenuContentActions },
  props: {
    isActions: {
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
