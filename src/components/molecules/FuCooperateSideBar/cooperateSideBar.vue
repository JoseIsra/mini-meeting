<template>
  <section class="m-sideBar" v-touch:swipe.left="handleLeftMovement">
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
import { defineComponent, toRefs } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';
import FuCooperateUsersList from 'molecules/FuCooperateUsersList';
import FuCooperateNotes from 'molecules/FuCooperateNotes';
import { useSidebarToogle, useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuCooperateSideBar',
  components: { FuCooperateChat, FuCooperateUsersList, FuCooperateNotes },
  setup(props) {
    let { functionsOnMenuBar } = useToogleFunctions();
    let { setSidebarState } = useSidebarToogle();
    const handleLeftMovement = () => {
      setSidebarState(false);
    };

    return {
      functionsOnMenuBar,
      ...toRefs(props),
      handleLeftMovement,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
