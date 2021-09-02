<template>
  <section class="m-sideBar">
    <fu-cooperate-chat />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuCooperateChat from 'molecules/FuCooperateChat';

export default defineComponent({
  name: 'FuCooperateSideBar',
  components: { FuCooperateChat },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateSideBar.scss';
</style>
