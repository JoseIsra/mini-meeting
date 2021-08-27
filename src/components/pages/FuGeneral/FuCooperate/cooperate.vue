<template>
  <div class="p-cooperate">
    <fu-t-cooperate />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import FuTCooperate from 'templates/FuGeneral/FuCooperate';

export default defineComponent({
  name: 'FuPCooperate',
  components: { FuTCooperate },
});
</script>
