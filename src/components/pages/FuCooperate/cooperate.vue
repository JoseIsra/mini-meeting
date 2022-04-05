<template>
  <div class="p-cooperate">
    <fu-t-cooperate />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

import FuTCooperate from 'templates/FuCooperate';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import FractalUpCooperateZoid from '@/utils/zoid';

export default defineComponent({
  name: 'FuPCooperate',
  components: { FuTCooperate },
});
</script>
