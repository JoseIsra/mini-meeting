<template>
  <div>
    <fu-t-prejoin-page />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuTPrejoinPage from 'templates/FuPrejoinPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FractalUpCooperateZoid from '@/utils/zoid';
export default defineComponent({
  name: 'FuPPrejoinPage',
  components: { FuTPrejoinPage },
  setup() {
    return {};
  },
});
</script>
