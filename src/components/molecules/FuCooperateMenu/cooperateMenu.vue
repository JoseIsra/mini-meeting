<template>
  <div
    :style="styleObject"
    :class="[
      'a-cooperateMenu',
      { '--actions': isActions },
      { '--options': isOptions },
      { '--functions': renderFunctions && !isActions },
      { '--chatmenu': chatOptions },
    ]"
  >
    <fu-menu-content-functions
      v-if="renderFunctions && !isActions"
      :objectFunctionalities="objectFunctionalities"
    />
    <fu-menu-content-options v-if="isOptions" />
    <fu-menu-content-chat v-if="chatOptions" />
    <q-icon
      :class="[
        'a-cooperateMenu__tail',
        { '--specialcase': isActions },
        { '--chatcase': chatOptions },
      ]"
      name="arrow_drop_down"
      size="50px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed, PropType } from 'vue';
import FuMenuContentOptions from 'molecules/FuMenuContentOptions';
import FuMenuContentFunctions from 'molecules/FuMenuContentFunctions';
import FuMenuContentChat from 'molecules/FuMenuContentChat';
import { Functionalities } from '@/types';
export default defineComponent({
  name: 'FuCooperateMenu',
  components: {
    FuMenuContentOptions,
    FuMenuContentFunctions,
    FuMenuContentChat,
  },
  props: {
    isActions: {
      type: Boolean,
    },
    renderFunctions: {
      type: Boolean,
    },
    objectFunctionalities: {
      type: Object as PropType<Functionalities>,
    },
    isOptions: {
      type: Boolean,
    },
    chatOptions: {
      type: Boolean,
    },
    width: {
      type: String,
    },
    bottom: {
      type: String,
    },
  },
  setup(props) {
    const styleObject = computed(() => ({
      '--width': props.width,
      '--bottom': props.bottom,
    }));
    return {
      ...toRefs(props),
      styleObject,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenu.scss';
</style>
