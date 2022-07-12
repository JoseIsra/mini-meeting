<template>
  <div class="a-menuBar">
    <section :class="['a-menuBar__box', modifierClass]">
      <aside class="a-menuBar__periferics">
        <q-btn
          flat
          round
          :class="['a-menuBar__icon', { active: userMe.isMicOn }]"
          :icon="
            !userMe.isMicOn
              ? iconsPeriferics.mic.offState
              : iconsPeriferics.mic.onState
          "
          :disable="
            userMe.isPublishing == 2 || userMe.isMicBlocked || !userMe.hasMic
          "
          size="13px"
          @click="toggleMIC"
        >
          <q-tooltip class="bg-grey-10" v-if="userMe.micPublishedState == 0">
            <label class="a-menuBar__icon__tooltip">
              {{
                !userMe.isMicOn
                  ? iconsPeriferics.mic.toolTipMessage
                  : iconsPeriferics.mic.toolTipSecondMessage
              }}
            </label>
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          :class="['a-menuBar__icon', { active: userMe.isCameraOn }]"
          :icon="
            userMe.cameraPublishedState == 1
              ? iconsPeriferics.camera.onState
              : userMe.cameraPublishedState == 2
              ? iconsPeriferics.camera.loadingState
              : iconsPeriferics.camera.offState
          "
          :disable="
            userMe.isPublishing == 2 ||
            userMe.isCameraBlocked ||
            !userMe.hasWebcam
          "
          size="13px"
          @click="toggleCamera"
        >
          <q-tooltip class="bg-grey-10">
            <label class="a-menuBar__icon__tooltip">
              {{
                !userMe.isCameraOn
                  ? iconsPeriferics.camera.toolTipMessage
                  : iconsPeriferics.camera.toolTipSecondMessage
              }}
            </label>
          </q-tooltip>
        </q-btn>
      </aside>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick } from 'vue';
import { MediaType, LAYOUT } from '@/utils/enums/general';
import { iconsPeriferics, iconsFunctions } from '@/helpers/iconsMenuBar';

import {
  useHandleMessage,
  useHandleParticipants,
  useScreen,
  useUserMe,
  useToogleFunctions,
  useSidebarToogle,
} from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import { usePanels } from '@/composables/panels';
import { useJitsiError } from '@/composables/jitsiError';
import { useLayout } from '@/composables/layout';
import { useMainView } from '@/composables/mainView';
import { iconsOptions } from '@/helpers/iconsMenuBar';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { MAIN_VIEW_MODE, MAIN_VIEW_LOCKED_TYPE } from '@/utils/enums';
import { onClickOutside } from '@vueuse/core';

export default defineComponent({
  name: 'FuCooperateMenuBar',
  setup() {
    /* const { options } = useActions(); */

    const { waitingParticipants } = useHandleParticipants();

    // const { roomState } = useRoom();

    let openNetworkConfig = ref(false);
    const target = ref(null);

    let isActions = ref<boolean>(false);
    let isOptions = ref<boolean>(false);
    let renderFunctionResponsiveMenu = ref<boolean>(false);
    let actionSelectionID = ref<string>('');
    let { functionsOnMenuBar, openFunctionResponsiveMenu } =
      useToogleFunctions();

    const {
      turnOnLocalMic,
      turnOffLocalMic,
      turnOnLocalCamera,
      turnOffLocalCamera,
      sendNotification,
      roomAddTrack,
      updateRoomJitsi,
      testReplaceAudio,
      replaceLocalTrack,
    } = useJitsi();
    const { openAdminPanel, setTabSharedWarning } = usePanels();
    const { errorsCallback } = useJitsiError();
    const { layout } = useLayout();
    const { mainViewState } = useMainView();

    let { isSidebarRender, setSidebarState } = useSidebarToogle();

    const {
      userMe,
      setMicState,
      setVideoActivatedState,
      setCameraState,
      setScreenState,
      localTracks,
      localVideoTrack,
      setLocalCameraLocked,
      updateUserMe,
    } = useUserMe();

    const canSeeActionsMenu = ref(userMe.roleId === 0);
    const showAdminPanel = ref(false);
    const { chatNotification, amountOfNewMessages } = useHandleMessage();

    const devicesAvailable = computed(() => {
      return userMe.isScreenSharing
        ? 'desktop'
        : userMe.hasWebcam
        ? 'video'
        : '';
    });

    const modifierClass = computed(() => ({
      '--presentation': layout.value == LAYOUT.PRESENTATION_LAYOUT,
      '--screenPresentation':
        layout.value == LAYOUT.PRESENTATION_LAYOUT &&
        mainViewState.mode != MAIN_VIEW_MODE.NONE,
    }));

    const toggleCamera = () => {
      if (userMe.isCameraOn) {
        setVideoActivatedState(false);
        turnOffLocalCamera();
        sendNotification('TURN_OFF_CAMERA', { value: userMe.id });
      } else {
        //send notification
        updateUserMe({ isPublishing: 2 });
        void nextTick(() => {
          turnOnLocalCamera();
        });
        setVideoActivatedState(true);
        sendNotification('TURN_ON_CAMERA', { value: userMe.id });
      }
      setCameraState(!userMe.isCameraOn);
      updateRoomJitsi(userMe);
    };

    const toggleMIC = () => {
      if (userMe.isMicOn) {
        turnOffLocalMic();
        // enviar notificación a participantes
        sendNotification('TURN_OFF_MIC', { value: userMe.id });
      } else {
        turnOnLocalMic();
        // enviar notificación a participantes
        sendNotification('TURN_ON_MIC', { value: userMe.id });
      }
      setMicState(!userMe.isMicOn);
      updateRoomJitsi(userMe);
    };

    const startScreenSharing = (tracks: JitsiLocalTrack[]) => {
      const desktopAudioTrack = tracks.find(
        (track) => track.getType() === MediaType.AUDIO
      );
      const desktopVideoTrack = tracks.find(
        (track) => track.getType() === MediaType.VIDEO
      );

      if (desktopVideoTrack) {
        setVideoActivatedState(true);
        setLocalCameraLocked(true);
        updateRoomJitsi(userMe);
        localTracks.value.push(desktopVideoTrack);
        void nextTick(() => {
          localTracks.value[1].attach(localVideoTrack.value);
        });
        roomAddTrack(desktopVideoTrack, null);
        sendNotification('INIT_SCREEN_SHARING', { value: userMe.id });
      }

      if (desktopAudioTrack) {
        // send audio
        testReplaceAudio(localTracks.value[0], desktopAudioTrack, false);
        setTabSharedWarning(true);
      }
    };

    const stopScreenSharing = (tracks: JitsiLocalTrack[]) => {
      setLocalCameraLocked(false);
      setVideoActivatedState(false);
      sendNotification('FINISH_SCREEN_SHARING', { value: userMe.id });
      sendNotification('PIN_USER_FOR_ALL_PARTICIPANTS', {
        value: JSON.stringify({
          mode: MAIN_VIEW_MODE.NONE,
          pinnedUsers: [],
          startedBy: userMe.id,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
        }),
      });
      setTabSharedWarning(false);
      if (!tracks[0]) return;

      localTracks.value.push(tracks[0]);
      void nextTick(() => {
        localTracks.value[1].attach(localVideoTrack.value);
      });
      roomAddTrack(tracks[0], null);
      void tracks[0].mute();
      replaceLocalTrack(localTracks.value[0], MediaType.AUDIO);
    };

    const toggleDesktopScreenCapture = async () => {
      setScreenState(!userMe.isScreenSharing);
      // apagar local track
      if (localTracks.value[1]) {
        if (userMe.isCameraOn) {
          setCameraState(false);
        }
        localTracks.value[1].dispose();
        void localTracks.value.pop();
      }
      try {
        const tracks = (await JitsiMeetJS.createLocalTracks({
          devices: [devicesAvailable.value],
        })) as JitsiLocalTrack[];

        if (userMe.isScreenSharing) {
          startScreenSharing(tracks);
        } else {
          stopScreenSharing(tracks);
        }
      } catch (error: unknown) {
        const castError = error as Error;
        errorsCallback(castError.name, castError.message);
      }
    };

    const { updateScreenState } = useScreen();

    const minimizeScreen = () => {
      updateScreenState();
      setSidebarState(false);
    };

    onClickOutside(target, () => {
      openFunctionResponsiveMenu(false);
    });

    return {
      userMe,
      isActions,
      actionSelectionID,
      renderFunctionResponsiveMenu,
      openNetworkConfig,
      functionsOnMenuBar,
      isOptions,
      canSeeActionsMenu,
      toggleCamera,
      toggleMIC,
      iconsPeriferics,
      showAdminPanel,
      chatNotification,
      waitingParticipants,
      iconsFunctions,
      toggleDesktopScreenCapture,
      isSidebarRender,
      minimizeScreen,
      iconsOptions,
      amountOfNewMessages,
      openAdminPanel,
      modifierClass,
      target,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
