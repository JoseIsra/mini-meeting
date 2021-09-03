<template>
  <section class="m-sideBar">
    <fu-cooperate-chat v-if="functionsOnMenuBar.renderChat" />
    <div
      v-if="functionsOnMenuBar.renderNotes && !functionsOnMenuBar.renderChat"
    >
      listas
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';
import { useToogleFunctions } from '@/componsables';

export default defineComponent({
  name: 'FuCooperateSideBar',
  components: { FuCooperateChat },
  setup() {
    let { functionsOnMenuBar } = useToogleFunctions();
    return {
      functionsOnMenuBar,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
