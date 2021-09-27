<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="option in actions"
        :key="option.id"
        @click="executeAction(option.interaction)"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__actionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>

    <q-dialog v-model="modal">
      <fu-retransmission-content v-if="filterContent == 'RETRANSMISSION'" />
      <fu-external-video-modal
        v-if="filterContent == 'EXTERNALVIDEO'"
        @hide-modal="hideModal"
      />
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';
import FuRetransmissionContent from 'molecules/FuRetransmissionContent';
import { useToogleFunctions } from '@/composables';
import FuExternalVideoModal from 'molecules/FuExternalVideoModal';
import { useExternalVideo } from '@/composables/external-video';

export default defineComponent({
  name: 'FuMenuContentActions',
  components: {
    FuRetransmissionContent,
    FuExternalVideoModal,
  },
  setup() {
    const { openOptionsMenu } = useToogleFunctions();
    const actions = ref<Options[]>(menuActions);
    const filterContent = ref('');
    let modal = ref(false);
    const { externalVideo } = useExternalVideo();

    const executeAction = (interaction: string) => {
      openOptionsMenu(false);
      modal.value = true;
      filterContent.value = interaction;
    };

    const hideModal = () => {
      modal.value = false;
    };

    return {
      modal,
      actions,
      filterContent,
      executeAction,
      hideModal,
      externalVideo,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
