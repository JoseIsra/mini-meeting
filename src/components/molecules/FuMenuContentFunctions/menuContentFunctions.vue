<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="icon in icons"
        :key="icon.id"
        @click="handleFunctionSelected(icon.interaction)"
      >
        <q-icon :name="icon.onState" size="18px" />
        <label class="a-menu__actionList__item__description">{{
          icon.toolTipMessage
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { iconsFunctions } from '@/helpers/iconsMenuBar';
import { Icons, Functionalities } from '@/types';

export default defineComponent({
  name: 'FuMenuFunctions',
  props: {
    objectFunctionalities: {
      type: Object as PropType<Functionalities>,
    },
  },
  setup(props) {
    const icons = ref<Icons[]>(iconsFunctions);
    const handleFunctionSelected = (interaction: string) => {
      props?.objectFunctionalities?.[interaction as keyof Functionalities]?.();
    };
    return {
      icons,
      handleFunctionSelected,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentFunctions.scss';
</style>
