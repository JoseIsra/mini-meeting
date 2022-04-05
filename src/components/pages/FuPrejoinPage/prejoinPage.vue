<template>
  <div>
    <fu-t-prejoin-page />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FuTPrejoinPage from 'templates/FuPrejoinPage';

export default defineComponent({
  name: 'FuPPrejoinPage',
  components: { FuTPrejoinPage },
  setup() {
    return {};
  },
});
</script>
