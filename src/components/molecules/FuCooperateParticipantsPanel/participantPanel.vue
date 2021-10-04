<template>
  <div class="m-participant-panel">
    <p>PARTICIPANT PANEL</p>

    <h5 v-if="!waitingParticipants.length > 0">Sin Solicitudes de ingreso</h5>

    <p v-else v-for="participant in waitingParticipants" :key="participant.id">
      <fu-participant-request :participant="participant" />
    </p>
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
