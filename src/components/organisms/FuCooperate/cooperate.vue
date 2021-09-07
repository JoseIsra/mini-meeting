<template>
  <section class="o-cooperate" @mousemove="toogleMenuBar">
    <fu-cooperate-header />
    <fu-cooperate-body />
    <fu-cooperate-menu-bar
      v-show="showMenuBar"
      :webRTCAdaptor="webRTCAdaptor"
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :toggleDesktopCapture="toggleDesktopCapture"
    />
    <transition name="slide">
      <fu-cooperate-side-bar
        v-show="isSidebarRender"
        :webRTCAdaptor="webRTCAdaptor"
      />
    </transition>
    <fu-cooperate-user-video :objStreams="objStreams" />
    <q-dialog
      v-model="functionsOnMenuBar.handNotificationActive"
      position="right"
      seamless
    >
      <fu-hand-notification />
    </q-dialog>
  </section>
</template>
//TODO: OBJETO DE USUARIO GLOBAL
<script lang="ts">
import { defineComponent, ref, PropType, toRefs, onMounted } from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'atoms/FuCooperateHeader';
import FuCooperateBody from 'molecules/FuCooperateBody';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import FuHandNotification from 'atoms/FuHandNotification';
import _ from 'lodash';
import { objWebRTC, WebRTCAdaptorType } from '@/types';
import { useSidebarToogle, useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuCooperate',
  props: {
    objStreams: {
      type: Array as PropType<objWebRTC[]>,
    },
    toggleLocalCamera: {
      type: Function,
    },
    toggleLocalMic: {
      type: Function,
    },
    toggleDesktopCapture: {
      type: Function,
    },
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateBody,
    FuCooperateSideBar,
    FuCooperateUserVideo,
    FuHandNotification,
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted');
    });

    let showMenuBar = ref<boolean>(false);
    let { isSidebarRender } = useSidebarToogle();
    const { functionsOnMenuBar } = useToogleFunctions();
    const hideMenuBar = _.debounce(() => {
      showMenuBar.value = false;
    }, 6000);

    const toogleMenuBar = () => {
      if (!showMenuBar.value) {
        showMenuBar.value = true;
      } else {
        hideMenuBar();
      }
    };
    return {
      toogleMenuBar,
      showMenuBar,
      ...toRefs(props),
      isSidebarRender,
      functionsOnMenuBar,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
