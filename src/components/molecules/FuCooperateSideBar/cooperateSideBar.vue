<template>
  <section class="m-sideBar">
    <label> Barra lateral con contenido dinámico </label>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperateSideBar',
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
