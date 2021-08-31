<template>
  <section class="o-cooperate" @mousemove="toogleMenuBar">
    <fu-cooperate-header />
    <fu-cooperate-body />
    <fu-cooperate-menu-bar v-show="showMenuBar" />
    <!-- <fu-cooperate-side-bar /> -->
    <fu-cooperate-user-video />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'atoms/FuCooperateHeader';
import FuCooperateBody from 'molecules/FuCooperateBody';
import FuCooperateUserVideo from 'atoms/FuCooperateUserVideo';
// import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import _ from 'lodash';

export default defineComponent({
  name: 'FuCooperate',
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateBody,
    FuCooperateUserVideo,
  },
  setup() {
    let showMenuBar = ref<boolean>(false);
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
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
