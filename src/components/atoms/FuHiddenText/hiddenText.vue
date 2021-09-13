<template>
  <div class="a-hiddenTextContainer">
    <div
      class="a-hiddenTextContainer__toggleButton"
      @click="showText = !showText"
    >
      Transmitir usando RTMP <q-icon name="fas fa-chevron-down" />
    </div>
    <div v-show="showText" class="a-hiddenTextContainer__hidden">
      <p>Server: rtmp://dialguiba.tech/WebRTCAppEE/</p>
      <p>Stream Key: {{ userMe.id }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUserMe } from '@/composables/userMe';

export default defineComponent({
  name: 'FuAHiddenText',
  props: {},
  setup() {
    const { userMe } = useUserMe();

    const showText = ref(false);
    return {
      showText,
      userMe,
    };
  },
});
</script>

<style scoped lang="scss">
@import './hiddenText.scss';
</style>
