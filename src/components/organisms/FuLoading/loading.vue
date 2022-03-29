<template>
  <div
    class="fullscreen text-white text-center q-pa-md flex flex-center"
    :style="{ background: '#36393f' }"
  >
    <div>
      <figure>
        <img
          :style="{ width: '40vw', 'max-width': '300px', 'min-width': '200px' }"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
          alt="logo-fractalup"
        />
      </figure>

      <q-spinner-dots color="blue-1" size="2em" />
      <div :style="{ 'font-size': '2vw', opacity: '0.3', margin: '12px 0' }">
        {{ loadingMessage }}
      </div>

      <!-- <q-btn v-if="loadingMessage !== ''" label="Regresar" @click="leaveCall" /> -->

      <q-btn
        v-if="
          loadingMessage ===
          'Error al publicar stream. Por favor, recarga la página'
        "
        label="Recargar"
        @click="refreshPage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'FuTLoading',
  props: {
    loadingMessage: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const leaveCall = () => emit('handleLeaveCall');
    const refreshPage = () => {
      window.location.reload();
    };

    return { ...toRefs(props), leaveCall, refreshPage };
  },
});
</script>

<style lang="sass">
@import 'loading'
</style>
