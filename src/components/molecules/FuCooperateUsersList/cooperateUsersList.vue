<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
    </header>
    <main class="m-list__content">
      <figure class="m-list__content__imgBox">
        <q-img
          class="m-list__content__imgBox__image"
          alt="fractalito"
          spinner-color="white"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/fractalito/emotional/totoro.svg"
          fit="contain"
        />
      </figure>
      <p class="m-list__content__message">Coming soon😀</p>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
