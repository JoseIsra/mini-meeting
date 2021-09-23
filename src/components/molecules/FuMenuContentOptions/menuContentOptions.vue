<template>
  <section class="a-menu">
    <ul class="a-menu__optionList">
      <li
        class="a-menu__optionList__item"
        v-for="option in options.firstSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
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
        v-for="(option) in options.fourthSection"
        :class="[
          'a-menu__optionList__item',
          { '--important': option.important },
        ]"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
        v-show="option.id === '9' ? isAdmin : false"
      >
        <q-icon :name="option.iconName" size="18px" color="white" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
    <q-dialog v-model="openModal">
      <fu-delete-room-modal />
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';
import { ZoidWindow } from '@/types/zoid';
import FuDeleteRoomModal from 'molecules/FuDeleteRoomModal';
import { useToogleFunctions } from '@/composables';
import { useUserMe } from '@/composables/userMe';

interface OptionsClickMethods {
  LEAVE: () => void;
  END: () => void;
  ROOMDETAILS: () => void;
}
export default defineComponent({
  name: 'FuMenuContentOptions',
  components: { FuDeleteRoomModal },
  setup() {
    const options = ref<MenuOptions>(menuOptions);
    let openModal = ref(false);
    const { watchInfoRoomCard, openOptionsMenu } = useToogleFunctions();

    const { isAdmin} = useUserMe();

    const optionsMethodsObject = reactive<OptionsClickMethods>({
      LEAVE: () => (window as ZoidWindow).xprops?.handleLeaveCall?.(),
      END: () => openDeleteRoomModal(),
      ROOMDETAILS: () => openInfoRoomCard(),
    });

    const openDeleteRoomModal = () => {
      openModal.value = true;
    };

    const openInfoRoomCard = () => {
      watchInfoRoomCard(true);
    };

    const handleOptionSelected = (interaction?: string) => {
      optionsMethodsObject[interaction as keyof OptionsClickMethods]();
      openOptionsMenu(false);
    };

    return {
      options,
      handleOptionSelected,
      openModal,
      isAdmin
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
