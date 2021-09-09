<template>
  <div
    class="fullscreen text-white text-center q-pa-md flex flex-center"
    :style="{ background: '#36393f' }"
  >
    <div>
      <figure>
        <img
          :style="{ width: '40vw', 'max-width': '300px', 'min-width': '200px' }"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
          alt="logo-fractalup"
        />
      </figure>

      <div :style="{ 'font-size': '2vw', opacity: '0.3' }">
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
      default: '',
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
