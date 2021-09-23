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
import { defineComponent, ref } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';
import FuRetransmissionContent from 'molecules/FuRetransmissionContent';
import { useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuMenuContentActions',
  components: {
    FuRetransmissionContent,
  },
  setup() {
    const { openOptionsMenu } = useToogleFunctions();
    const actions = ref<Options[]>(menuActions);
    const filterContent = ref('');
    let modal = ref(false);
    const openModal = (interaction: string) => {
      openOptionsMenu(false);
      modal.value = true;
      filterContent.value = interaction;
    };

    return {
      modal,
      actions,
      filterContent,
      openModal,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
