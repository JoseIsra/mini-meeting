<template>
  <section class="a-menu">
    <ul class="a-menu__optionList">
      <li
        class="a-menu__optionList__item"
        v-for="option in options.firstSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <q-separator spaced color="white" />
      <li
        class="a-menu__optionList__item"
        v-for="option in options.secondSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <q-separator spaced color="white" />
      <li
        class="a-menu__optionList__item"
        v-for="option in options.thirdSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <q-separator spaced color="white" />
      <li
        v-for="option in options.fourthSection"
        :class="[
          'a-menu__optionList__item',
          { '--important': option.important },
        ]"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="18px" color="white" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';

export default defineComponent({
  name: 'FuMenuContentOptions',
  setup() {
    const options = ref<MenuOptions>(menuOptions);

    return {
      options,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
