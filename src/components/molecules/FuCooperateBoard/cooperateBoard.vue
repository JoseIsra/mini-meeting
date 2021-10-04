<template>
  <div class="o-cooperate-board">
    <canvas id="board"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  setup() {
    onMounted(() => {
      console.log('On mounted');
    });

    return {};
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
