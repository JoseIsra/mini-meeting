<template>
  <header class="a-header">
    <figure class="a-header__logo">
      <img
        class="a-header__logo__image"
        src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
        alt="logo-collaborate"
      />
    </figure>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FuCooperateHeader',
});
</script>

<style lang="scss" scoped>
@import './cooperateHeader.scss';
</style>
