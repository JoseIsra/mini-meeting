<template>
  <section class="m-perifericsPanel">
    <div class="m-perifericsPanel__imageBorder">
      <q-img
        :ratio="16 / 9"
        width="120px"
        height="120px"
        class="m-perifericsPanel__image"
        src="https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg"
        spinner-color="white"
      />
    </div>

    <p class="m-perifericsPanel__message">
      El poder de los periféricos al alcance de tu mano
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuParticipantPerifericPanel',
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
@import './participantPerifericPanel.scss';
</style>
