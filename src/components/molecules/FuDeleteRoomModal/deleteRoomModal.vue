<template>
  <q-card class="m-room">
    <q-card-section tag="header" class="m-room__header">
      <h4 class="m-room__header__info">
        ¿Terminar la sesión para todos los usuarios?
      </h4>
    </q-card-section>
    <q-card-section tag="div" class="m-room__body">
      <q-btn
        label="Sí"
        class="m-room__body__btn --proceed"
        :ripple="false"
        text-color="green"
        @click="executeDeleteRoom"
      />
      <q-btn
        label="No"
        v-close-popup
        text-color="red"
        class="m-room__body__btn --cancel"
        :ripple="false"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { REASON_TO_LEAVE_ROOM } from '@/utils/enums';
import { useJitsi } from '@/composables/jitsi';
import { useUserMe } from '@/composables';

export default defineComponent({
  name: 'FuDeleteRoom',

  setup() {
    const { sendNotification } = useJitsi();
    const { userMe } = useUserMe();

    const executeDeleteRoom = () => {
      sendNotification('MODERATOR_ENDS_CALL', {
        value: JSON.stringify({
          moderatorID: userMe.id,
        }),
      });
      window.xprops?.handleLeaveCall?.(REASON_TO_LEAVE_ROOM.I_CLOSE_ROOM, []);
    };

    return {
      executeDeleteRoom,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deleteRoomModal.scss';
</style>
