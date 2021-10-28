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

    <div class="o-lobby__info">
      <div class="o-lobby__info__wrapper">
        <div class="o-lobby__title">Sala Privada</div>

        <div class="o-lobby__subtitle">
          {{ lobbyMessage }}
        </div>

        <q-btn style="margin: 12px 0" v-if="userMe.denied" label="Regresar" @click="leaveCall" />

        <q-circular-progress
          v-if="!userMe.denied"
          indeterminate
          size="40px"
          :thickness="0.4"
          font-size="50px"
          color="blue-5"
          track-color="grey-3"
          center-color="grey-8"
          class="q-ma-md"
        />

        <!-- <q-btn icon="fas fa-check" color="green" @click="askPermission" /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
// import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { PERMISSION_STATUS } from '@/utils/enums';
// import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'FuLobby',
  setup(props, { emit }) {
    const { userMe } = useUserMe();
    // const { sendData } = useInitWebRTC();
    const leaveCall = () => emit('handleLeaveCall');

    const lobbyMessage = computed(() => {
      if (userMe.denied === PERMISSION_STATUS.asked) {
        return 'Aguarda a que un moderador te otorgue permiso para entrar a la sala';
      } else if (userMe.denied === PERMISSION_STATUS.admitted) {
        return 'Se te ha permitido ingresar';
      } else {
        return 'No se te ha permitido ingresar en la reunion';
      }
    });

    return {
      lobbyMessage,
      userMe,
      PERMISSION_STATUS,
      leaveCall,
    };
  },
});
</script>

<style lang="scss">
@import './lobby.scss';
</style>
