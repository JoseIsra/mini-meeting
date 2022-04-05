<template>
  <div class="p-prejoin">
    <fu-t-prejoin-page />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import FuTPrejoinPage from 'templates/FuPrejoinPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FractalUpCooperateZoid from '@/utils/zoid';
export default defineComponent({
  name: 'FuPPrejoinPage',
  components: { FuTPrejoinPage },
});
</script>
