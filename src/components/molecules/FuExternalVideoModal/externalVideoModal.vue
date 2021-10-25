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
import { useExternalVideo } from '@/composables/external-video';
import { useToogleFunctions } from '@/composables';
import { errorMessage, successMessage } from '@/utils/notify';
import { useInitWebRTC } from '@/composables/antMedia';
import { useRoom } from '@/composables/room';
import { useUserMe } from '@/composables/userMe';
import videojs from 'video.js';

export default defineComponent({
  name: 'FuExternalVideoModal',
  setup(_prop, { emit }) {
    let inputURL = ref('');
    const { updateExternalVideoState, externalVideo, setVideoInstance } =
      useExternalVideo();
    const { sendData } = useInitWebRTC();
    const { setFullScreen } = useToogleFunctions();
    const regexYoutube = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    const { roomState } = useRoom();
    const { userMe, updateUserMe } = useUserMe();

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
        setFullScreen('video', true);
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
      updateExternalVideoState({
        ...externalVideo,
        videoOnRoom: false,
        urlVideo: '',
        isVideoPlaying: false,
        videoCurrentTime: 0,
      });
      setVideoInstance({} as HTMLMediaElement & { playerId: string });
      sendData(roomState.hostId, {
        remoteInstance: userMe.videoInstance,
        eventType: 'REMOVE_EXTERNAL_VIDEO',
      });
      videojs(userMe.videoInstance?.playerId).dispose();
      setFullScreen('none', false);
      updateUserMe({
        ...userMe,
        existVideo: false,
        urlOfVideo: '',
        videoInstance: {} as HTMLMediaElement & { playerId: string },
        currentTime: 0,
        isPlayingVideo: false,
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
