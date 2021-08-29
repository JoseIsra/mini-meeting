<template>
  <section class="o-cooperate">
    <header class="o-cooperate__header">
      <figure class="o-cooperate__header__logo">
        <img
          class="o-cooperate__header__logo__image"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/FractalUp-Collaborate.svg"
          alt="logo-collaborate"
        />
      </figure>
    </header>
    <main class="o-cooperate__screen">
      <figure class="o-cooperate__screen__imgBox">
        <img
          class="o-cooperate__screen__imgBox__image"
          alt="fractalitos"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png"
        />
      </figure>
    </main>
    <fu-cooperate-menu-bar />
    <!-- <section class="o-cooperate__userVideoStreams">
      <fu-cooperate-user-video v-for="user in users" :key="user.id" />
    </section> -->
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { userStreams } from '@/helpers/usersVideo';
import FuCooperateMenuBar from 'organisms/FuCooperateMenuBar';
interface UserStream {
  id: string;
  name: string;
}

export default defineComponent({
  name: 'FuCooperate',
  components: { FuCooperateMenuBar },
  setup() {
    const users = ref<UserStream[]>(userStreams);
    return {
      users,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
