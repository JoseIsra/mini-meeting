<template>
  <div class="a-cooperateMenu">
    <section class="a-cooperateMenu__content">
      <ul class="a-cooperateMenu__content__optionList">
        <li
          class="a-cooperateMenu__content__optionList__item"
          v-for="option in options.firstSection"
          :key="option.id"
        >
          <q-icon :name="option.iconName" size="20px" />
          <label
            class="a-cooperateMenu__content__optionList__item__description"
            >{{ option.description }}</label
          >
        </li>
        <q-separator spaced color="white" />
        <li
          class="a-cooperateMenu__content__optionList__item"
          v-for="option in options.secondSection"
          :key="option.id"
        >
          <q-icon :name="option.iconName" size="18px" />
          <label
            class="a-cooperateMenu__content__optionList__item__description"
            >{{ option.description }}</label
          >
        </li>
        <q-separator spaced color="white" />
        <li
          class="a-cooperateMenu__content__optionList__item"
          v-for="option in options.thirdSection"
          :key="option.id"
        >
          <q-icon :name="option.iconName" size="18px" />
          <label
            class="a-cooperateMenu__content__optionList__item__description"
            >{{ option.description }}</label
          >
        </li>
        <q-separator spaced color="white" />
        <li
          class="a-cooperateMenu__content__optionList__item"
          v-for="option in options.fourthSection"
          :key="option.id"
        >
          <q-icon :name="option.iconName" size="18px" color="white" />
          <label
            class="a-cooperateMenu__content__optionList__item__description"
            >{{ option.description }}</label
          >
        </li>
      </ul>
    </section>

    <q-icon class="a-cooperateMenu__tail" name="arrow_drop_down" size="50px" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';

export default defineComponent({
  name: 'FuCooperateMenu',
  props: {
    isOptionsButton: {
      type: Boolean,
      default: false,
    },
    isActionsButton: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const options = ref<MenuOptions>(menuOptions);

    return {
      ...toRefs(props),
      options,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenu.scss';
</style>
