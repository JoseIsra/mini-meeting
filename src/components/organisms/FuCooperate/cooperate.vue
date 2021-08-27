<template>
  <section class="o-cooperate">
    <header class="o-cooperate__header">
      <figure class="o-cooperate__header__logo">
        <img
          class="o-cooperate__header__logo__image"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/LogoFU_head.svg"
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
    <div class="o-cooperate__menuBar">iconos aqui</div>
  </section>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperate',
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
