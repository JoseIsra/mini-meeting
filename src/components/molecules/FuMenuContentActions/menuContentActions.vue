<template>
  <section class="a-menu">
    <ul class="a-menu__actionList">
      <li
        class="a-menu__actionList__item"
        v-for="option in actions"
        :key="option.id"
        v-on="
          watchVideoOnRoom && option.interaction == 'EXTERNALVIDEO'
            ? { click: removeVideoOnRoom }
            : { click: () => executeAction(option.interaction) }
        "
      >
        <q-icon :name="option.iconName" size="20px" />
        <label
          class="a-menu__actionList__item__description"
          v-if="watchVideoOnRoom && option.interaction == 'EXTERNALVIDEO'"
          >{{ option.secondDescription }}</label
        >
        <label v-else class="a-menu__actionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>

    <q-dialog v-model="modal">
      <fu-retransmission-content v-if="filterContent == 'RETRANSMISSION'" />
      <fu-external-video-modal
        v-if="filterContent == 'EXTERNALVIDEO'"
        @hide-modal="hideModal"
      />
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { menuActions, Options } from '@/helpers/menuOptions';
import FuRetransmissionContent from 'molecules/FuRetransmissionContent';
import { useToogleFunctions } from '@/composables';
import FuExternalVideoModal from 'molecules/FuExternalVideoModal';
import { useExternalVideo } from '@/composables/external-video';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import videojs from 'video.js';

export default defineComponent({
  name: 'FuMenuContentActions',
  components: {
    FuRetransmissionContent,
    FuExternalVideoModal,
  },
  setup() {
    const { openOptionsMenu, setFullScreen } = useToogleFunctions();
    const actions = ref<Options[]>(menuActions);
    const filterContent = ref('');
    let modal = ref(false);
    const { externalVideo, updateExternalVideoState, setVideoInstance } =
      useExternalVideo();
    const { sendData } = useInitWebRTC();
    const { userMe, updateUserMe } = useUserMe();

    const executeAction = (interaction: string) => {
      openOptionsMenu(false);
      modal.value = true;
      filterContent.value = interaction;
    };

    const hideModal = () => {
      modal.value = false;
    };

    const watchVideoOnRoom = computed(() => {
      return externalVideo.videoOnRoom;
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
      sendData(userMe.id, {
        remoteInstance: userMe.videoInstance,
        eventType: 'REMOVE_EXTERNAL_VIDEO',
      });
      videojs(userMe.videoInstance?.playerId as string).dispose();
      setFullScreen('none');
      updateUserMe({
        ...userMe,
        existVideo: false,
        urlOfVideo: '',
        videoInstance: {} as HTMLMediaElement & { playerId: string },
        currentTime: 0,
        isPlayingVideo: false,
      });
    };

    return {
      modal,
      actions,
      filterContent,
      executeAction,
      hideModal,
      externalVideo,
      watchVideoOnRoom,
      removeVideoOnRoom,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentActions.scss';
</style>
