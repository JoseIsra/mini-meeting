<template>
  <q-card class="m-external">
    <q-card-section class="m-external__content">
      <q-input outlined v-model="inputURL" />
    </q-card-section>
    <q-card-section>
      <q-btn label="go" @click="stablishURL" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useExternalVideo } from '@/composables/external-video';
import { useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuExternalVideoModal',
  setup() {
    let inputURL = ref('');
    const { setUrlVideo } = useExternalVideo();
    const { setFullScreen } = useToogleFunctions();

    const stablishURL = () => {
      //TODO VALIDAR INPUT CON CONTENIDO
      setUrlVideo(inputURL.value);
      setFullScreen('video');
    };

    return {
      stablishURL,
      inputURL,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideoModal';
</style>
