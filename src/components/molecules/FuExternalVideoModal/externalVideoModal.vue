<template>
  <section class="m-external">
    <p class="m-external__message">
      Agrega el link de un video en YouTube y compártelo con todos los
      participantes
    </p>

    <form class="m-external__content">
      <input
        v-show="!externalVideo.videoOnRoom"
        class="m-external__content__input"
        v-model="inputURL"
        placeholder="URL DEL VIDEO"
      />
      <p v-show="externalVideo.videoOnRoom" class="m-external__content__hint">
        Hay un video compartiéndose actualmente
      </p>
      <q-btn
        :class="[
          'm-external__content__btn --share',
          { '--disable': !inputURL },
          { '--removeVideo': externalVideo.videoOnRoom },
        ]"
        :label="labelExternalVideoBtn"
        no-caps
        :disable="!externalVideo.videoOnRoom ? !inputURL : false"
        v-on="
          !externalVideo.videoOnRoom
            ? { click: stablishURL }
            : { click: removeVideoOnRoom }
        "
      />
    </form>
    <p class="m-external__message --hint">
      Nota: No todos los videos podrán reproducirse en todos los dispositivos
      móviles
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useExternalVideo, useUserMe, useJitsi } from '@/composables';
import { usePanels } from '@/composables/panels';
import { errorMessage, successMessage, warningMessage } from '@/utils/notify';

export default defineComponent({
  name: 'FuExternalVideoModal',
  setup() {
    let inputURL = ref('');
    const { externalVideo } = useExternalVideo();
    const regexYoutube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const { userMe, updateUserMe } = useUserMe();
    const { setOpenAdminPanel } = usePanels();
    const { sendNotification, updateJitsiParticipant } = useJitsi();

    const stablishURL = () => {
      if (!regexYoutube.test(inputURL.value))
        return errorMessage('El URL insertado no es correcto');

      const videoInfo = {
        urlVideo: parsedYoutubeUrl(inputURL.value),
        videoOwnerId: userMe.id,
      };
      updateJitsiParticipant();
      sendNotification('INIT_EXTERNAL_VIDEO', {
        value: JSON.stringify(videoInfo),
      });
      updateUserMe({ isVideoOwner: true });
      successMessage('Video externo agregado');
      setOpenAdminPanel(false);
    };

    const labelExternalVideoBtn = computed(() => {
      return externalVideo.videoOnRoom ? 'Quitar video' : 'Compartir video';
    });

    const parsedYoutubeUrl = (youtubeURL: string): string => {
      const youtubeId = new URL(youtubeURL).searchParams.get('v') as string;

      return `https://www.youtube.com/watch?v=${youtubeId}`;
    };

    const removeVideoOnRoom = () => {
      if (!userMe.isVideoOwner) {
        return warningMessage(
          'La persona quien compartió el video puede removerlo'
        );
      }
      sendNotification('REMOVE_EXTERNAL_VIDEO', {
        value: JSON.stringify({
          remoteInstanceId: externalVideo.remoteInstanceId,
        }),
      });
      updateUserMe({ isVideoOwner: false });
      setOpenAdminPanel(false);
    };

    return {
      stablishURL,
      inputURL,
      labelExternalVideoBtn,
      removeVideoOnRoom,
      externalVideo,
    };
  },
});
</script>

<style scoped lang="scss">
@import './externalVideoModal';
</style>
