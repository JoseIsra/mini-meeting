<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li class="a-menu__actionList__item" v-for="icon in icons" :key="icon.id">
        <q-icon :name="icon.onState" size="18px" />
        <label class="a-menu__actionList__item__description">{{
          icon.toolTipMessage
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { iconsFunctions } from '@/helpers/iconsMenuBar';
import { Icons } from '@/types';
export default defineComponent({
  name: 'FuMenuFunctions',
  setup() {
    const icons = ref<Icons[]>(iconsFunctions);
    return {
      icons,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentFunctions.scss';
</style>
