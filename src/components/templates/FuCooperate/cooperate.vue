<template>
  <div class="t-cooperate">
    <div
      class="t-cooperate__page"
      v-if="existRoom && isLoadingOrError === false"
    >
      <fu-lobby v-if="roomState.privacy" />

      <fu-cooperate
        v-else
        :toggleLocalCamera="toggleLocalCamera"
        :toggleLocalMic="toggleLocalMic"
        :toggleDesktopCapture="toggleDesktopCapture"
        @mounted="fuCooperateMountedHandler"
      />
    </div>

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
import FuLobby from 'organisms/FuLobby';

import { useRoute } from 'vue-router';
import { useUserMe } from '@/composables/userMe';
import FuTLoading from 'organisms/FuLoading';
import { PERMISSION_STATUS, REASON_TO_LEAVE_ROOM } from '@/utils/enums';
import { useInitWebRTC } from '@/composables/antMedia';
import { useAuthState } from '@/composables/auth';
import { useRoom } from '@/composables/room';
import { useActions } from '@/composables/actions';

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
    FuLobby,
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

    const {
      userMe,
      setUserMe,
      setVideoActivatedState,
      // setMicState,
      setCameraState,
      // setScreenState,
    } = useUserMe();

    const { roomState, setRoom } = useRoom();

    const route = useRoute();

    const {
      authState,
      setLoadingOrErrorMessage,
      setExistRoom,
      // setIsLoadingOrError,
    } = useAuthState();

    const { setMicIconState, setCameraIconState, setScreenShareIconState } =
      useActions();

    //Datos del usuario
    const streamId =
      window?.xprops?.streamId || (route.query.streamId as string) || '';

    const streamName =
      window?.xprops?.streamName || (route.query.streamName as string);

    const avatar =
      window?.xprops?.photoURL ||
      (route.query.photoURL as string) ||
      'https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg';

    const roomId =
      window?.xprops?.roomId || (route.query.roomId as string) || '';

    const classroomId =
      window?.xprops?.classroomId || (route.query.classroomId as string) || '1';

    const roleId =
      window.xprops?.roleId || parseInt(route.query.roleId as string) || 0;

    const privacy =
      window.xprops?.privacy ||
      (route.query.privacy as string) === '1' ||
      false;

    const isMicLocked =
      window.xprops?.isMicLocked ||
      (route.query.mic as string) === '1' ||
      false;

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked =
      window.xprops?.isScreenShareLocked ||
      (route.query.screen as string) === '1' ||
      false;

    const sharingLink =
      window?.xprops?.sharedLink || (route.query.sharedLink as string) || '';

    const fractalUserId =
      window?.xprops?.fractalUserId ||
      (route.query.fractalUserId as string) ||
      '';

    const isCameraOn =
      window?.xprops?.isCameraOn ||
      (route.query.isCameraOn as string) === 'camera' ||
      false;

    const isMicOn =
      window?.xprops?.isMicOn ||
      (route.query.isMicOn as string) == 'micro' ||
      false;

    if (isCameraOn) {
      setVideoActivatedState(true);
      setCameraState(true);
      setCameraIconState(true);
    }
    setUserMe({
      id: streamId,
      name: streamName,
      avatar,
      roleId: roleId,
      isMicOn: isMicOn ? true : isMicLocked,
      isCameraOn,
      isScreenSharing: false,
      isVideoActivated: isCameraOn,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
      fractalUserId,
      denied:
        roleId === 1
          ? privacy
            ? PERMISSION_STATUS.asked
            : PERMISSION_STATUS.admitted
          : PERMISSION_STATUS.admitted,
      existVideo: false,
      isRecording: false,
    });

    setMicIconState(isMicLocked || isMicOn);
    // setCameraIconState(!isCameraLocked);
    // setScreenShareIconState(!isScreenShareLocked);

    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      privacy: roleId === 1 ? privacy : false,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
    });

    if (isMicLocked) {
      sendNotificationEvent('MIC_MUTED', streamId);
      // if (roleId === 1) {
      //   setMicState(!isMicLocked);
      // }
    }

    if (isCameraLocked) {
      setVideoActivatedState(!isCameraLocked);
      sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
      // if (roleId === 1) {
      //   setCameraState(!isCameraLocked);
      // }
    }

    if (isScreenShareLocked) {
      setVideoActivatedState(!isScreenShareLocked);
      sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
      // if (roleId === 1) {
      //   setScreenState(!isScreenShareLocked);
      // }
    }

    const publishToken =
      window?.xprops?.publishToken ||
      (route.query.publishToken as string) ||
      '';

    const playToken =
      window?.xprops?.playToken || (route.query.playToken as string) || '';

    const subscriberId = (route.query.subscriberId as string) || undefined;

    const subscriberCode = (route.query.subscriberCode as string) || undefined;

    //const currentVolume = ref(0.5);

    const toggleDesktopCapture = () => {
      if (userMe.isScreenSharing) {
        setScreenShareIconState(false);
        resetDesktop();
        sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
      }
      if (userMe.isCameraOn && !userMe.isScreenSharing) {
        turnOffLocalCamera(streamId);
        switchDesktopCaptureWithCamera(streamId);
      } else if (!userMe.isCameraOn && !userMe.isScreenSharing) {
        setScreenShareIconState(true);
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
          setCameraIconState(false);
          turnOffLocalCamera(streamId);
          sendNotificationEvent('CAM_TURNED_OFF', streamId);
        }
      } else {
        if (userMe.isScreenSharing) {
          switchDesktopCaptureWithCamera(streamId);
        } else {
          turnOnLocalCamera(streamId);
        }

        setCameraIconState(true);
        sendNotificationEvent('CAM_TURNED_ON', streamId);
      }
    };

    const toggleLocalMic = () => {
      if (!userMe.isMicOn) {
        setMicIconState(true);
        unmuteLocalMic();
        sendNotificationEvent('MIC_UNMUTED', streamId);
      } else {
        setMicIconState(false);
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
        `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/conference-rooms/${roomId}`,
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
          // To review
          // setIsLoadingOrError(false);
          createInstance(
            roomId,
            streamId,
            streamName,
            publishToken,
            playToken,
            subscriberId,
            subscriberCode
          );
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
      // createInstance(
      //   roomId,
      //   streamId,
      //   streamName,
      //   publishToken,
      //   playToken,
      //   subscriberId,
      //   subscriberCode
      // );
      window.xprops?.logJoined?.();
    };

    /* onUnmounted(() => {
      leaveRoom();
    });

    window.addEventListener('unload', () => {
      leaveRoom();
    }); */

    const handleZoidLeaveCall = () =>
      window.xprops?.handleLeaveCall?.(REASON_TO_LEAVE_ROOM.JUST_LEAVE);

    return {
      fuCooperateMountedHandler,
      roomId,
      toggleLocalCamera,
      toggleLocalMic,
      toggleDesktopCapture,
      handleZoidLeaveCall,
      ...toRefs(authState),
      roomState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
