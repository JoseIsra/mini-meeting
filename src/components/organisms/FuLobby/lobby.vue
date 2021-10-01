<template>
  <div
    class="o-lobby fullscreen text-white text-center q-pa-md flex flex-center"
  >
    <div class="o-lobby__logo">
      <!-- To review: Tiene estado absolute, deberia estar en el DOM? o seguir flotando -->
      <img
        class="o-lobby__logo__image"
        src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
        alt="logo-collaborate"
      />
    </div>

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
          style="
            text-transform: capitalize;
            margin-top: 40px;
            padding: 5px 25px;
          "
          @click="askPermission"
        />

        <q-circular-progress
          v-else
          indeterminate
          size="40px"
          :thickness="0.4"
          font-size="50px"
          color="blue-5"
          track-color="grey-3"
          center-color="grey-8"
          class="q-ma-md"
        />

        <q-btn
          v-if="userMe.roleId === 0"
          label="Unirse"
          rounded
          color="blue"
          text-color="white"
          style="
            text-transform: capitalize;
            margin-top: 40px;
            padding: 5px 25px;
          "
          @click="enterAsAdmin"
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
import { useRoom } from '@/composables/room';

export default defineComponent({
  name: 'FuLobby',
  setup() {
    const { userMe, setDenied } = useUserMe();
    const { setPrivacy } = useRoom();
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

    const enterAsAdmin = () => setPrivacy(false);

    return {
      askPermission,
      enterAsAdmin,
      lobbyMessage,
      userMe,
    };
  },
});
</script>

<style lang="scss">
@import './lobby.scss';
</style>
