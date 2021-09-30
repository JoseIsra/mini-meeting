<template>
  <div
    class="o-lobby fullscreen text-white text-center q-pa-md flex flex-center"
  >
    <div class="o-lobby__media">
      <div class="o-lobby__media__screen"></div>
      <div class="o-lobby__media__actions">
        <q-btn icon="mic" />
        <q-btn icon="videocam" />
        <q-btn icon="monitor" />
        <q-btn icon="settings" />
      </div>
    </div>
    <div class="o-lobby__info">
      <div class="o-lobby__info__wrapper">
        <div class="o-lobby__title">Room Name</div>
        <div class="o-lobby__label">
          {{ lobbyMessage }}
        </div>
        <q-btn
          v-if="userMe.denied === 0"
          label="Solicitar unirse"
          rounded
          color="blue"
          text-color="white"
          style="text-transform: capitalize; margin-top: 40px"
          @click="askPermission"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { PERMISSION_STATUS } from '@/utils/enums';
import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'FuLobby',
  setup() {
    const { userMe, setDenied } = useUserMe();
    const { sendData } = useInitWebRTC();

    const lobbyMessage = computed(() => {
      if (userMe.denied === PERMISSION_STATUS.notAsked) {
        return 'Aguarda a que un moderador te otorgue permiso para entrar a la sala';
      } else if (userMe.denied === PERMISSION_STATUS.asked) {
        return 'Esperando que un moderador te permita ingresar';
      } else {
        return 'No se te ha permitido ingresar en la reunion';
      }
    });

    const askPermission = () => {
      sendData(userMe.id, {
        id: nanoid(),
        eventType: 'ASK_PERMISSION',
        participantId: userMe.id,
        participantName: userMe.name,
      });
      setDenied(PERMISSION_STATUS.asked);
    };

    return {
      askPermission,
      lobbyMessage,
      userMe,
    };
  },
});
</script>

<style lang="scss">
@import './lobby.scss';
</style>
