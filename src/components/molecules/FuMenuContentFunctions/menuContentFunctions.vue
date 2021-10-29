<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        @click="handleFunctionSelected(INTERACTION_TYPE_MENU_BAR.USERLIST)"
      >
        <q-icon :name="iconsFunctions.users.onState" size="18px" />
        <label class="a-menu__actionList__item__description">{{
          iconsFunctions.users.toolTipMessage
        }}</label>
      </li>
      <li
        class="a-menu__actionList__item"
        @click="handleFunctionSelected(INTERACTION_TYPE_MENU_BAR.CHAT)"
      >
        <q-icon :name="iconsFunctions.chat.onState" size="18px" />
        <label class="a-menu__actionList__item__description">{{
          iconsFunctions.chat.toolTipMessage
        }}</label>
      </li>
      <li
        class="a-menu__actionList__item"
        @click="handleFunctionSelected(INTERACTION_TYPE_MENU_BAR.MINIMIZE)"
      >
        <q-icon :name="iconsFunctions.minimize.onState" size="18px" />
        <label class="a-menu__actionList__item__description">{{
          iconsFunctions.minimize.toolTipMessage
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { iconsFunctions } from '@/helpers/iconsMenuBar';
import { Functionalities } from '@/types';
import { useToogleFunctions } from '@/composables';
import { INTERACTION_TYPE_MENU_BAR } from '@/utils/enums';

export default defineComponent({
  name: 'FuMenuFunctions',
  props: {
    objectFunctionalities: {
      type: Object as PropType<Functionalities>,
    },
  },
  setup(props) {
    const { openFunctionResponsiveMenu } = useToogleFunctions();

    const handleFunctionSelected = (interaction: string) => {
      props?.objectFunctionalities?.[interaction as keyof Functionalities]?.();
      openFunctionResponsiveMenu(false);
    };

    return {
      iconsFunctions,
      INTERACTION_TYPE_MENU_BAR,
      handleFunctionSelected,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentFunctions.scss';
</style>
