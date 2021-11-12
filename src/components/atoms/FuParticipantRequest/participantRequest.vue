<template>
  <div class="a-participantRequest">
    <div class="a-participantRequest__info">
      {{ participant.name }}
    </div>
    <div class="a-participantRequest__actions">
      <!-- label="Admitir" -->
      <q-btn
        style="padding: 8px; margin-right: 8px"
        icon-right="fas fa-check"
        color="green"
        text-color="white"
        rounded
        dense
        @click="admitParticipant"
        size="10px"
      />
      <!-- label="Denegar" -->
      <q-btn
        style="padding: 8px"
        icon-right="fas fa-times-circle"
        color="red"
        text-color="white"
        rounded
        dense
        @click="denyParticipant"
        size="10px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useRoom, useHandleParticipants, useInitWebRTC } from '@/composables';
import { PERMISSION_STATUS } from '@/utils/enums';
import { User } from '@/types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'FuParticipantRequest',
  props: {
    participant: {
      type: Object as PropType<Partial<User>>,
      required: true,
    },
  },
  setup(props) {
    const { updateParticipantDenied } = useHandleParticipants();
    const { roomState } = useRoom();

    const { sendData } = useInitWebRTC();

    const admitParticipant = () => {
      console.log('Admitir participante: ', props.participant.id);

      sendData(roomState.hostId, {
        id: '',
        participantId: props.participant.id,
        eventType: 'ANSWER_PERMISSION',
        value: true,
      });

      updateParticipantDenied(
        props.participant.id as string,
        PERMISSION_STATUS.admitted
      );
    };

    const denyParticipant = () => {
      console.log('Denegar participante: ', props.participant.id);

      sendData(roomState.hostId, {
        id: '',
        participantId: props.participant.id,
        eventType: 'ANSWER_PERMISSION',
        value: false,
      });

      updateParticipantDenied(
        props.participant.id as string,
        PERMISSION_STATUS.denied
      );
    };

    return {
      admitParticipant,
      denyParticipant,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './participantRequest.scss';
</style>
