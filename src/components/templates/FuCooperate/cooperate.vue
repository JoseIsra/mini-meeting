<template>
  <div class="t-cooperate">
    <fu-cooperate
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :toggleDesktopCapture="toggleDesktopCapture"
      v-if="existRoom"
      @mounted="fuCooperateMountedHandler"
    />
    <fu-t-loading
      v-if="isLoadingOrError"
      :loadingMessage="loadingOrErrorMessage"
      @handleLeaveCall="handleZoidLeaveCall"
    />
    <!-- TODO: Move This (Prev of recording) -->
    <video
      v-show="false"
      id="localVideo2"
      class="a-userVideo__box__stream"
      autoplay
      muted
      playsinline
    ></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, onMounted } from 'vue';
import FuCooperate from 'organisms/FuCooperate';
import { useRoute } from 'vue-router';
import { useUserMe } from '@/composables/userMe';
import { ZoidWindow } from '@/types/zoid';
import FuTLoading from 'organisms/FuLoading';

import { useInitWebRTC } from '@/composables/antMedia';

import { useAuthState } from '@/composables/auth';

import { useRoom } from '@/composables/room';

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
  },
  setup() {
    const {
      createInstance,
      turnOffLocalCamera,
      resetDesktop,
      switchDesktopCaptureWithCamera,
      switchDesktopCapture,
      switchVideoCameraCapture,
      turnOnLocalCamera,
      unmuteLocalMic,
      muteLocalMic,
      sendNotificationEvent,
      justTurnOnLocalCamera,
    } = useInitWebRTC();
    const { userMe, setUserMe, setVideoActivatedState } = useUserMe();
    const { setRoom } = useRoom();
    const route = useRoute();
    const { authState, setLoadingOrErrorMessage, setExistRoom } =
      useAuthState();

    //Datos del usuario
    const streamId =
      (window as ZoidWindow)?.xprops?.streamId ||
      (route.query.streamId as string) ||
      '';

    const streamName =
      (window as ZoidWindow)?.xprops?.streamName ||
      (route.query.streamName as string);

    const avatar =
      (window as ZoidWindow)?.xprops?.photoURL ||
      (route.query.photoURL as string) ||
      'https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg';

    const roomId =
      (window as ZoidWindow)?.xprops?.roomId ||
      (route.query.roomId as string) ||
      '';

    // Estado inicial, cooperate actions blocked by default or allowed (?)
    const blockActions = false;

    const roleId = (window as ZoidWindow)?.xprops?.roleId || 0;

    setUserMe({
      id: streamId,
      name: streamName,
      avatar,
      isCameraOn: false,
      isMicOn: true,
      isScreenSharing: false,
      isVideoActivated: false,
      roleId: roleId,
      isMicBlocked: blockActions,
      isVideoBlocked: blockActions,
      isScreenShareBlocked: blockActions
    });

    setRoom({
      id: roomId,
    });

    const publishToken =
      (window as ZoidWindow)?.xprops?.publishToken ||
      (route.query.publishToken as string) ||
      '';
    const playToken =
      (window as ZoidWindow)?.xprops?.playToken ||
      (route.query.playToken as string) ||
      '';
    const subscriberId = (route.query.subscriberId as string) || undefined;
    const subscriberCode = (route.query.subscriberCode as string) || undefined;

    //const currentVolume = ref(0.5);

    const toggleDesktopCapture = () => {
      if (userMe.isScreenSharing) {
        console.log('DESACTIVAO');
        resetDesktop();
        sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
      }
      if (userMe.isCameraOn && !userMe.isScreenSharing) {
        turnOffLocalCamera(streamId);
        switchDesktopCaptureWithCamera(streamId);
      } else if (!userMe.isCameraOn && !userMe.isScreenSharing) {
        switchDesktopCapture(streamId);
        setVideoActivatedState(true);
        sendNotificationEvent('SCREEN_SHARING_ON', streamId);
      } else if (userMe.isCameraOn && userMe.isScreenSharing) {
        switchVideoCameraCapture(streamId);
      }

      if (!userMe.isCameraOn && userMe.isScreenSharing) {
        turnOffLocalCamera(streamId);
      } else {
        justTurnOnLocalCamera(streamId);
      }
    };
    const toggleLocalCamera = () => {
      if (userMe.isCameraOn) {
        if (userMe.isScreenSharing) {
          switchDesktopCapture(streamId);
        } else {
          turnOffLocalCamera(streamId);
          sendNotificationEvent('CAM_TURNED_OFF', streamId);
        }
      } else {
        if (userMe.isScreenSharing) {
          switchDesktopCaptureWithCamera(streamId);
        } else {
          turnOnLocalCamera(streamId);
        }
        sendNotificationEvent('CAM_TURNED_ON', streamId);
      }
    };
    const toggleLocalMic = () => {
      if (!userMe.isMicOn) {
        unmuteLocalMic();
        sendNotificationEvent('MIC_UNMUTED', streamId);
      } else {
        muteLocalMic();
        sendNotificationEvent('MIC_MUTED', streamId);
      }
    };

    /* const changeVolume = () => {
       webRTCAdaptor.value.currentVolume = currentVolume.value;
      if (webRTCAdaptor.value.soundOriginGainNode != null) {
        webRTCAdaptor.value.soundOriginGainNode.gain.value =
          currentVolume.value;
      }
      if (webRTCAdaptor.value.secondStreamGainNode != null) {
        webRTCAdaptor.value.secondStreamGainNode.gain.value =
          currentVolume.value;
      }
    }; */

    /* const leaveRoom = () => {
      webRTCAdaptor.value.leaveFromRoom?.(roomId);

      participants.value = [];
    }; */

    const checkRoom = async (roomId: string) => {
      const request = new Request(
        `https://dialguiba.tech/WebRTCAppEE/rest/v2/broadcasts/conference-rooms/${roomId}`,
        {
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
          },
        }
      );

      const res = await fetch(request);

      return {
        status: res.status,
        message: res.statusText,
        body:
          res.status === 200
            ? ((await res.json()) as Record<string, string>)
            : '',
      };
    };

    onMounted(async () => {
      if (roomId) {
        const { status } = await checkRoom(roomId);
        if (status === 200) {
          setExistRoom(true);
        } else if (status === 404) {
          setLoadingOrErrorMessage('Cooperate not found');
        } else {
          setLoadingOrErrorMessage('Not Allowed');
        }
      } else {
        setLoadingOrErrorMessage('Please, provide a room id');
      }
    });

    //TODO: Dont dissapear loading until the host accept the user. Needed to implement logic for that (dont publish neither play streams)

    const fuCooperateMountedHandler = () => {
      createInstance(
        roomId,
        streamId,
        streamName,
        publishToken,
        playToken,
        subscriberId,
        subscriberCode
      );
    };

    /* onUnmounted(() => {
      leaveRoom();
    });

    window.addEventListener('unload', () => {
      leaveRoom();
    }); */

    const handleZoidLeaveCall = () =>
      (window as ZoidWindow).xprops?.handleLeaveCall?.();

    return {
      fuCooperateMountedHandler,
      roomId,
      toggleLocalCamera,
      toggleLocalMic,
      toggleDesktopCapture,
      handleZoidLeaveCall,
      ...toRefs(authState),
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
