<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="option in actions"
        :key="option.id"
        @click="openModal(option.interaction)"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__actionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>

    <q-dialog v-model="modal">
      <fu-retransmission-content />
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, VueElement } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';
import FuRetransmissionContent from 'molecules/FuRetransmissionContent';

interface FuCooperateModal extends VueElement {
  openModal: () => void;
}

export default defineComponent({
  name: 'FuMenuContentActions',
  components: {
    FuRetransmissionContent,
  },
  setup() {
    const actions = ref<Options[]>(menuActions);
    // const modalState = ref(false);
    const filterContent = ref('');
    // const modal = ref<FuCooperateModal>();
    let modal = ref(false);
    const openModal = (interaction: string) => {
      // modal.value?.openModal();
      modal.value = true;
      console.log(modal.value);
      filterContent.value = interaction;
    };

    return {
      modal,
      actions,
      filterContent,
      // modalState,
      openModal,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
