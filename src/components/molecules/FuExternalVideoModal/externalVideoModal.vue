<template>
  <q-card class="m-external">
    <q-card-section class="m-external__content" tag="div">
      <p class="m-external__content__message">Compartir video externo</p>
      <q-input
        outlined
        v-model="inputURL"
        color="grey-4"
        label-color="grey-1"
        label="URL de video externo"
        :input-style="{ color: '#fffffe' }"
      />
    </q-card-section>
    <q-card-section class="m-external__actions">
      <q-btn
        class="m-external__actions__btn"
        label="Compartir video"
        no-caps
        :disable="!inputURL"
        @click="stablishURL"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useExternalVideo } from '@/composables/external-video';
import { useToogleFunctions } from '@/composables';
import { errorMessage } from '@/utils/notify';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';

export default defineComponent({
  name: 'FuExternalVideoModal',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(_prop, { emit }) {
    let inputURL = ref('');
    const { updateExternalVideoState, externalVideo } = useExternalVideo();
    const { sendData } = useInitWebRTC();
    const { userMe } = useUserMe();
    const { setFullScreen } = useToogleFunctions();
    const regexYoutube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;

    const stablishURL = () => {
      if (regexYoutube.test(inputURL.value)) {
        const URLData = {
          eventType: 'SHARE_EXTERNAL_VIDEO',
          urlContent: inputURL.value,
        };
        updateExternalVideoState({
          ...externalVideo,
          videoOnRoom: true,
          urlVideo: inputURL.value,
        });
        setFullScreen('video');
        sendData(userMe.id, URLData);
        emit('hide-modal');
        return;
      }
      errorMessage('El URL insertado no es correcto');
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
