<template>
  <div class="a-hiddenTextContainer">
    <div
      class="a-hiddenTextContainer__toggleButton"
      @click="showText = !showText"
    >
      Transmitir usando RTMP <q-icon name="fas fa-chevron-down" />
    </div>
    <div v-show="showText" class="a-hiddenTextContainer__hidden">
      <p>Server: rtmp://{{ server }}/{{ app }}/</p>
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
    const server = ref<string>(process.env.ANTMEDIA_SERVER);
    const app = ref<string>(process.env.ANTMEDIA_APP);

    const showText = ref(false);
    return {
      showText,
      userMe,
      server,
      app,
    };
  },
});
</script>

<style scoped lang="scss">
@import './hiddenText.scss';
</style>
