<template>
  <div class="m-participant-panel">
    <div class="m-participant-panel__title">Solicitudes de Ingreso</div>

    <h5
      class="m-participant-panel__title"
      v-if="!waitingParticipants.length > 0"
    >
      Sin Solicitudes de ingreso
    </h5>

    <div
      class="m-participant-panel__list"
      v-else
      v-for="participant in waitingParticipants"
      :key="participant.id"
    >
      <fu-participant-request :participant="participant" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuParticipantRequest from '@/components/atoms/FuParticipantRequest';
import { useHandleParticipants } from '@/composables/participants';
import { useSidebarToogle } from '@/composables';

export default defineComponent({
  name: 'FuCooperateParticipantPanel',
  components: {
    FuParticipantRequest,
  },
  setup() {
    const { waitingParticipants } = useHandleParticipants();

    const { toggleParticipantPanel } = useSidebarToogle();

    return {
      waitingParticipants,
      toggleParticipantPanel,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './participantPanel.scss';
</style>
