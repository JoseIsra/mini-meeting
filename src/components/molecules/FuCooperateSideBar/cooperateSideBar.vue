<template>
  <section class="m-sideBar">
    <fu-cooperate-chat v-show="functionsOnMenuBar.renderChat" />
    <fu-cooperate-notes
      v-show="functionsOnMenuBar.renderNotes && !functionsOnMenuBar.renderChat"
    />
    <fu-cooperate-users-list
      v-show="
        functionsOnMenuBar.renderUsersList &&
        !functionsOnMenuBar.renderChat &&
        !functionsOnMenuBar.renderNotes
      "
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';
import FuCooperateUsersList from 'molecules/FuCooperateUsersList';
import FuCooperateNotes from 'molecules/FuCooperateNotes';
import { useToogleFunctions } from '@/componsables';

export default defineComponent({
  name: 'FuCooperateSideBar',
  components: { FuCooperateChat, FuCooperateUsersList, FuCooperateNotes },
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
