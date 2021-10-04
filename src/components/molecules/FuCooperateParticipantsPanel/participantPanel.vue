<template>
  <div class="m-participant-panel">
    <p>PARTICIPANT PANEL</p>

    <p v-for="participant in waitingParticipants" :key="participant.id">
      <fu-participant-request :participant="participant" />
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuParticipantRequest from '@/components/atoms/FuParticipantRequest';
import { useHandleParticipants } from '@/composables/participants';

export default defineComponent({
  name: 'FuCooperateParticipantPanel',
  components: {
    FuParticipantRequest,
  },
  setup() {
    const { waitingParticipants } = useHandleParticipants();

    return {
      waitingParticipants,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './participantPanel.scss';
</style>
