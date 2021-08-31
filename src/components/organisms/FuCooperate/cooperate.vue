<template>
  <section class="o-cooperate" @mousemove="toogleMenuBar">
    <fu-cooperate-header />
    <fu-cooperate-body />
    <fu-cooperate-menu-bar v-show="showMenuBar" />
    <!-- <section class="o-cooperate__userVideoStreams">
      <fu-cooperate-user-video v-for="user in users" :key="user.id" />
    </section> -->
    <fu-cooperate-side-bar />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { userStreams } from '@/helpers/usersVideo';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
import FuCooperateHeader from 'atoms/FuCooperateHeader';
import FuCooperateBody from 'molecules/FuCooperateBody';
import FuCooperateSideBar from 'molecules/FuCooperateSideBar';
import _ from 'lodash';
interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperate',
  components: {
    FuCooperateMenuBar,
    FuCooperateHeader,
    FuCooperateBody,
    FuCooperateSideBar,
  },
  setup() {
    const users = ref<UserStream[]>(userStreams);
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
      users,
      toogleMenuBar,
      showMenuBar,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
