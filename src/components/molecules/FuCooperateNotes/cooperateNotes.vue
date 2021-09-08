<template>
  <section class="m-notes">
    <header class="m-notes__title">
      <label class="m-notes__title__text">Notas compartidas</label>
    </header>
    <main class="m-notes__content">
      <figure class="m-notes__content__imgBox">
        <q-img
          class="m-notes__content__imgBox__image"
          alt="fractalito"
          spinner-color="white"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/fractalito/emotional/totoro.svg"
          fit="contain"
        />
      </figure>
      <p class="m-notes__content__message">Coming soon😀</p>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperateNotes',
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateNotes.scss';
</style>
