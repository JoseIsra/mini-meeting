<template>
  <section class="m-sideBar">
    <fu-cooperate-chat
      v-show="functionsOnMenuBar.renderChat"
      :webRTCAdaptor="webRTCAdaptor"
    />
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
import { defineComponent, PropType, toRefs } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';
import FuCooperateUsersList from 'molecules/FuCooperateUsersList';
import FuCooperateNotes from 'molecules/FuCooperateNotes';
import { useToogleFunctions } from '@/componsables';
import { WebRTCAdaptorType } from '@/types';

export default defineComponent({
  name: 'FuCooperateSideBar',
  props: {
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  components: { FuCooperateChat, FuCooperateUsersList, FuCooperateNotes },
  setup(props) {
    let { functionsOnMenuBar } = useToogleFunctions();
    return {
      functionsOnMenuBar,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
