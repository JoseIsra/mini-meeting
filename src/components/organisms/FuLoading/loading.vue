<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 10vw">Loading...</div>

      <div class="text-h2" style="opacity: 0.4">
        {{ loadingMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  name: 'FuTLoading',
  props: {
    loadingMessage: {
      type: String,
      default: 'Loading',
    },
  },
  setup(props) {
    let message = ref('hello world');
    return { ...toRefs(props), message };
  },
});
</script>

<style lang="sass">
@import 'loading'
</style>
