<template>
  <div>
    <t-fu-prejoin-page />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TFuPrejoinPage from 'templates/FuPrejoinPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FractalUpCooperateZoid from '@/utils/zoid';
export default defineComponent({
  name: 'PFuPrejoinPage',
  components: { TFuPrejoinPage },
  setup() {
    return {};
  },
});
</script>
