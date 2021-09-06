<template>
  <section class="o-cooperate" @mousemove="toogleMenuBar">
    <fu-cooperate-header />
    <fu-cooperate-body />
    <fu-cooperate-menu-bar
      v-show="showMenuBar"
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :toggleDesktopCapture="toggleDesktopCapture"
    />
    <fu-cooperate-side-bar v-show="isSidebarRender" />
    <fu-cooperate-user-video :objStreams="objStreams" />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, toRefs, onMounted } from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'atoms/FuCooperateHeader';
import FuCooperateBody from 'molecules/FuCooperateBody';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import _ from 'lodash';
import { objWebRTC } from '@/types';
import { useSidebarToogle } from '@/componsables';

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
  },
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateBody,
    FuCooperateSideBar,
    FuCooperateUserVideo,
  },
  setup(props, { emit }) {
    onMounted(() => {
      emit('mounted');
    });

    let showMenuBar = ref<boolean>(false);
    let { isSidebarRender } = useSidebarToogle();
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
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
