<template>
  <q-dialog :value-model="value" position="top" seamless flat>
    <q-card class="q-pa-sm a-warning">
      <p class="no-margin">
        Nota: Por ahora al compartir una pestaña con audio, no podrás seguir
        compartiendo el audio de tu micrófono
      </p>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: '',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './warning.scss';
</style>
