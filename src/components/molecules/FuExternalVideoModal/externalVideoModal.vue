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
import {
  useMainView,
  useInitWebRTC,
  useRoom,
  useExternalVideo,
  useUserMe,
} from '@/composables';
import { errorMessage, successMessage, warningMessage } from '@/utils/notify';
import videojs from 'video.js';
import { MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuExternalVideoModal',
  setup() {
    let inputURL = ref('');
    const { updateMainViewState } = useMainView();
    const { updateExternalVideoState, externalVideo } = useExternalVideo();

    const { sendData } = useInitWebRTC();
    const regexYoutube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const { roomState } = useRoom();
    const { userMe, updateUserMe } = useUserMe();
    const stablishURL = () => {
      if (regexYoutube.test(inputURL.value)) {
        const URLData = {
          eventType: 'SHARE_EXTERNAL_VIDEO',
          urlVideo: inputURL.value,
          videoOwnerId: userMe.id,
        };
        updateExternalVideoState({
          ...externalVideo,
          videoOnRoom: true,
          urlVideo: inputURL.value,
          isVideoPlaying: true,
          videoOwnerId: userMe.id,
        });
        updateMainViewState({
          mode: MAIN_VIEW_MODE.VIDEO,
        });
        sendData(roomState.hostId, URLData);
        updateUserMe({ videoOwner: true });
        successMessage('Video externo agregado');
        return;
      }
      errorMessage('El URL insertado no es correcto');
    };

    const labelExternalVideoBtn = computed(() => {
      return externalVideo.videoOnRoom ? 'Quitar video' : 'Compartir video';
    });

    const removeVideoOnRoom = () => {
      if (userMe.videoOwner) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
        });
        videojs(externalVideo.remoteInstanceId as string).dispose();
        sendData(roomState.hostId, {
          remoteInstanceId: externalVideo.remoteInstanceId,
          eventType: 'REMOVE_EXTERNAL_VIDEO',
        });
        updateExternalVideoState({
          ...externalVideo,
          videoOnRoom: false,
          urlVideo: '',
          isVideoPlaying: false,
          videoCurrentTime: 0,
          remoteInstanceId: '',
        });
        successMessage('Video externo removido');
        updateUserMe({ videoOwner: false });
      } else {
        warningMessage('La persona quien compartió el video puede removerlo');
      }
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
