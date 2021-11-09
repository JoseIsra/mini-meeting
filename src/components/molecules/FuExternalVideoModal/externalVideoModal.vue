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
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {
  useMainView,
  useInitWebRTC,
  useRoom,
  useUserMe,
  useExternalVideo,
} from '@/composables';
import { errorMessage, successMessage } from '@/utils/notify';
import videojs from 'video.js';
import { VideoID } from '@/types';
import { MAIN_VIEW_LOCKED_TYPE, MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuExternalVideoModal',
  setup(_prop, { emit }) {
    let inputURL = ref('');
    const { updateMainViewStateForAll, cleanMainViewStateForAll } =
      useMainView();
    const { updateExternalVideoState, externalVideo } = useExternalVideo();

    const { sendData } = useInitWebRTC();
    const regexYoutube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const { roomState } = useRoom();
    const { userMe } = useUserMe();

    const stablishURL = () => {
      if (regexYoutube.test(inputURL.value)) {
        const URLData = {
          eventType: 'SHARE_EXTERNAL_VIDEO',
          urlVideo: inputURL.value,
        };
        updateExternalVideoState({
          ...externalVideo,
          videoOnRoom: true,
          urlVideo: inputURL.value,
        });
        updateMainViewStateForAll({
          mode: MAIN_VIEW_MODE.VIDEO,
          locked: MAIN_VIEW_LOCKED_TYPE.NORMAL_USERS,
          startedBy: userMe.id,
        });
        //setFullScreen('video', true);
        sendData(roomState.hostId, URLData);
        emit('init-external-video');
        successMessage('Video externo agregado');
        return;
      }
      errorMessage('El URL insertado no es correcto');
    };

    const labelExternalVideoBtn = computed(() => {
      return externalVideo.videoOnRoom ? 'Quitar video' : 'Compartir video';
    });

    const removeVideoOnRoom = () => {
      cleanMainViewStateForAll();
      sendData(roomState.hostId, {
        remoteInstance: externalVideo.remoteInstance,
        eventType: 'REMOVE_EXTERNAL_VIDEO',
      });
      videojs((externalVideo.remoteInstance as VideoID).playerId).dispose();
      //setFullScreen('none', false);
      updateExternalVideoState({
        ...externalVideo,
        videoOnRoom: false,
        urlVideo: '',
        isVideoPlaying: false,
        videoCurrentTime: 0,
        remoteInstance: {} as HTMLMediaElement & { playerId: string },
      });
      successMessage('Video externo removido');
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
