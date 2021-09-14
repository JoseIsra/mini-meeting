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
      <!-- <q-separator spaced color="white" /> -->
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
      <!-- <q-separator spaced color="white" /> -->
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
      <!-- <q-separator spaced color="white" /> -->
      <li
        v-for="option in options.fourthSection"
        :class="[
          'a-menu__optionList__item',
          { '--important': option.important },
        ]"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
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
import { defineComponent, ref, PropType } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';
import { ZoidWindow } from '@/types/zoid';
import { WebRTCAdaptorType } from '@/types';
import { useUserMe } from '@/composables/userMe';

export default defineComponent({
  name: 'FuMenuContentOptions',
  props: {
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  setup(props) {
    const { userMe } = useUserMe();

    const options = ref<MenuOptions>(menuOptions);

    const handleOptionSelected = (interaction?: string) => {
      if (interaction === 'LEAVE') {
        console.log('leave');
        (window as ZoidWindow).xprops?.handleLeaveCall?.();
      } else if (interaction === 'END') {
        console.log('end');
        (window as ZoidWindow).xprops?.handleEndCall?.();
        props.webRTCAdaptor?.sendData?.(userMe.id, 'KICKED');
      }
    };

    return {
      options,
      handleOptionSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
