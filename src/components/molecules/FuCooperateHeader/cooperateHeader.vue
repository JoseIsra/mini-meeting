<template>
  <header class="m-header">
    <div class="m-header__logo">
      <img
        class="m-header__logo__image"
        src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
        alt="logo-collaborate"
      />
    </div>
    <div class="m-header__recordingContainer">
      <fu-recording />
    </div>
    <!-- <div class="m-header__minimizeContainer"> -->
    <!-- Para el botoón de minimizar -->
    <!-- <q-btn color="primary" icon="check" label="Minimizar" /> -->
    <!-- </div> -->

    <div
      v-show="!showBoard"
      class="m-header__activeBoard"
      @click="toggleShowBoard"
    >
      <q-icon
        style="margin-right: 10px"
        name="fas fa-drafting-compass"
        v-if="!showBoard"
      />
      <span v-if="!showBoard"> Pizarra activa</span>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuRecording from '@/components/molecules/FuRecording';
import { useBoard } from '@/composables';

export default defineComponent({
  name: 'FuCooperateHeader',
  components: {
    FuRecording,
  },
  setup() {
    const { showBoard, toggleShowBoard } = useBoard();
    return {
      showBoard,
      toggleShowBoard,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateHeader.scss';
</style>
