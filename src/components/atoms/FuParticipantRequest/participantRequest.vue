<template>
  <div class="a-participantRequest">
    <div class="a-participantRequest__info">
      {{ participant.name }}
    </div>
    <div class="a-participantRequest__actions">
      <q-btn
        style="padding: 8px"
        icon="fas fa-check"
        color="green"
        text-color="white"
        rounded
        dense
        @click="admitParticipant(participant)"
      />
      <q-btn
        style="padding: 8px"
        icon="fas fa-trash"
        color="red"
        text-color="white"
        rounded
        dense
        @click="denyParticipant(participant)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useInitWebRTC } from '@/composables/antMedia';
import { useHandleParticipants } from '@/composables/participants';
import { useUserMe } from '@/composables/userMe';
import { PERMISSION_STATUS } from '@/utils/enums/general';
import { Participant } from '@/types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'FuParticipantRequest',
  props: {
    participant: {
      type: Object as PropType<Participant>,
      required: true,
    },
  },
  setup(props) {
    const { updateParticipantDenied } = useHandleParticipants();

    const { userMe } = useUserMe();

    const { sendData } = useInitWebRTC();

    const admitParticipant = (participant: Participant) => {
      console.log('Admitir participante: ', participant.name);

      sendData(userMe.id, {
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

    const denyParticipant = (participant: Participant) => {
      console.log('Denegar participante: ', participant.name);

      sendData(userMe.id, {
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
