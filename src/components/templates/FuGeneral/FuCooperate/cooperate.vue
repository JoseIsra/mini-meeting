<template>
  <div class="t-cooperate">
    <fu-cooperate />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import FuCooperate from 'organisms/FuCooperate';

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
