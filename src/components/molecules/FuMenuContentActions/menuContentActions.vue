<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="option in actions"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__actionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';

export default defineComponent({
  name: 'FuMenuContentActions',
  setup() {
    const actions = ref<Options[]>(menuActions);

    return {
      actions,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
