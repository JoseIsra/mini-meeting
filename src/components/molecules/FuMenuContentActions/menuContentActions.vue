<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="option in actions"
        :key="option.id"
        @click="openModal"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__actionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
    <fu-modal ref="modal" />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, VueElement } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';
import FuModal from '@/components/organisms/FuModal';

interface FuModal extends VueElement {
  openModal: () => void;
}

export default defineComponent({
  name: 'FuMenuContentActions',
  components: {
    FuModal,
  },
  setup() {
    const actions = ref<Options[]>(menuActions);
    const modalState = ref(false);

    const modal = ref<FuModal>();

    const openModal = () => {
      modal.value?.openModal();
    };

    return {
      modal,
      actions,
      modalState,
      openModal,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
