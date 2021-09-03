<template>
  <section class="m-sideBar">
    <fu-cooperate-chat v-if="functionsOnMenuBar.thechat" />
    <div v-if="renderNotes && !functionsOnMenuBar.thechat">listas</div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';
import { useChatToogle, useNotesToogle } from '@/componsables';

export default defineComponent({
  name: 'FuCooperateSideBar',
  components: { FuCooperateChat },
  setup() {
    let { functionsOnMenuBar } = useChatToogle();
    let { renderNotes } = useNotesToogle();
    return {
      functionsOnMenuBar,
      renderNotes,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
