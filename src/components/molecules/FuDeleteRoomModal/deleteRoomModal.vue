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
import { useUserMe } from '@/composables/userMe';
import { useRoom } from '@/composables/room';
import { useInitWebRTC } from '@/composables/antMedia';
import { Participant } from '@/types';
import { REASON_TO_LEAVE_ROOM } from '@/utils/enums';
import { useHandleParticipants } from '@/composables/participants';
export default defineComponent({
  name: 'FuDeleteRoom',
  setup() {
    const { userMe } = useUserMe();
    const { roomState } = useRoom();
    const { sendData, sendNotificationEvent } = useInitWebRTC();
    const { participants } = useHandleParticipants();

    const executeDeleteRoom = () => {
      deleteRoom(roomState.id)
        .then(() => {
          sendData(userMe.id, { eventType: 'KICK', to: 'all' });

          const remainingParticipantsFractalUserIds = participants.value.reduce(
            (newArray: string[], participant: Participant) => {
              newArray.push(participant.fractalUserId as string);
              return newArray;
            },
            []
          );

          window.xprops?.handleLeaveCall?.(
            REASON_TO_LEAVE_ROOM.I_CLOSE_ROOM,
            remainingParticipantsFractalUserIds
          );

          if (userMe.isRecording) {
            sendNotificationEvent('RECORDING_STOPPED', userMe.id);
          }
        })
        .catch((e) => console.log(e));
    };

    const deleteRoom = async (roomId: string) => {
      const request = new Request(
        `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/conference-rooms/${roomId}`,
        {
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
          },
          method: 'DELETE',
        }
      );
      const res = await fetch(request);

      return {
        status: res.status,
        body: (await res.json()) as Record<string, string>,
      };
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
