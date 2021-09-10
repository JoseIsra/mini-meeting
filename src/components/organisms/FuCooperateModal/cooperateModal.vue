<template>
  <q-dialog v-model="layout" :style="{ width: '300px', height: '400px' }">
    <slot name="customized"></slot>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';
// import FuRetransmissionContent from 'molecules/FuRetransmissionContent';

export default defineComponent({
  name: 'FuCooperateModal',
  // components: { FuRetransmissionContent },
  props: {
    filterContent: {
      type: String,
    },
    open: {
      type: Boolean,
    },
  },
  setup(props) {
    // const layout = ref(false);
    let key = ref('');
    const layout = ref(props.open);
    const openModal = () => {
      layout.value = true;
    };
    return {
      openModal,
      layout,
      ...toRefs(props),
      key,
      drawer: ref(false),
      miniState: ref(true),
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateModal.scss';
</style>
