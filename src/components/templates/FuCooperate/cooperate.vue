<template>
  <div class="t-cooperate">
    <div
      class="t-cooperate__page"
      v-if="existRoom && isLoadingOrError === false"
    >
      <fu-lobby
        v-if="roomState.roomRestriction"
        @handleLeaveCall="handleZoidLeaveCall"
      />

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
import { useToogleFunctions } from '@/composables';
import moment from 'moment';

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
      switchDesktopCapture,
      turnOnLocalCamera,
      unmuteLocalMic,
      muteLocalMic,
      sendNotificationEvent,
    } = useInitWebRTC();

    const {
      userMe,
      setUserMe,
      setVideoActivatedState,
      // setMicState,
      setCameraState,
      setScreenState,
    } = useUserMe();

    const { roomState, setRoom } = useRoom();

    const route = useRoute();

    const {
      authState,
      setLoadingOrErrorMessage,
      setExistRoom,
      // setIsLoadingOrError,
    } = useAuthState();

    const { setMicIconState, setCameraIconState } = useActions();

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

    let roomRestriction = window.xprops?.roomRestriction as number;

    if (!roomRestriction) {
      roomRestriction = parseInt(route.query.roomRestriction as string) || 0;
    }

    const isMicLocked = window.xprops?.isMicLocked || false;

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = window.xprops?.isScreenShareLocked || false;

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

    const isHost =
      window?.xprops?.isHost ||
      (JSON.parse((route.query.isHost as string) || 'false') as boolean);

    let bgInfo = window?.xprops?.bgInfo || {
      url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
      maximized: false,
    };
    if (window?.xprops?.bgInfo?.url === '' || !window?.xprops?.bgInfo?.url) {
      bgInfo = {
        url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
        maximized: false,
      };
    }

    const userPinnedZoid = (window?.xprops?.pinnedUser as string) || '';

    const isBeingRecorded = window?.xprops?.isBeingRecorded || false;

    const { setIDButtonSelected, setFullScreen } = useToogleFunctions();

    setUserMe({
      id: streamId,
      name: streamName,
      avatar,
      roleId,
      isMicOn: roleId === 1 ? (isMicLocked ? false : isMicOn) : isMicOn,
      isCameraOn:
        roleId === 1 ? (isCameraLocked ? false : isCameraOn) : isCameraOn,
      isScreenSharing: false,
      isVideoActivated:
        roleId === 1 ? (isCameraLocked ? false : isCameraOn) : isCameraOn,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
      fractalUserId,
      denied: roomRestriction
        ? roleId === 1
          ? PERMISSION_STATUS.asked
          : PERMISSION_STATUS.admitted
        : PERMISSION_STATUS.admitted,
      existVideo: false,
      isRecording: false,
      isHost,
    });

    const startDate = window.xprops?.startDate || '2020-01-11 11:23';

    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      roomRestriction: roleId === 1 ? roomRestriction : 0,
      isMicBlocked: isMicLocked,
      isCameraBlocked: isCameraLocked,
      isScreenShareBlocked: isScreenShareLocked,
      bgInfo: bgInfo,
      isBeingRecorded,
      recordingUrl: '',
      pinnedUser: null,
      pinnedUserId: userPinnedZoid,
      startDate,
    });

    setMicIconState(roleId === 1 ? (isMicLocked ? false : isMicOn) : isMicOn);

    if (roleId === 1 ? (isCameraLocked ? false : isCameraOn) : isCameraOn) {
      setVideoActivatedState(true);
      setCameraIconState(true);
      setCameraState(true);
      turnOnLocalCamera(streamId);
      sendNotificationEvent('CAM_TURNED_ON', streamId);
    }

    if (userPinnedZoid) {
      setFullScreen('user', true);
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
        //si estoy compartiendo -> apago todo
        setVideoActivatedState(false);
        setScreenState(false);
        resetDesktop();
        sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
      } else {
        if (userMe.isCameraOn) {
          //apagar camara y prender captura
          setCameraIconState(false);
          setCameraState(false);
          turnOffLocalCamera(streamId);
          sendNotificationEvent('CAM_TURNED_OFF', streamId);
        }
        switchDesktopCapture(streamId);
        setVideoActivatedState(true);
        setScreenState(true);
        sendNotificationEvent('SCREEN_SHARING_ON', streamId);
      }
      // if (userMe.isCameraOn && !userMe.isScreenSharing) {
      //   turnOffLocalCamera(streamId);
      //   switchDesktopCaptureWithCamera(streamId);
      // } else if (!userMe.isCameraOn && !userMe.isScreenSharing) {
      //   setScreenShareIconState(true);
      //   switchDesktopCapture(streamId);
      //   setVideoActivatedState(true);
      //   sendNotificationEvent('SCREEN_SHARING_ON', streamId);
      // }

      // if (!userMe.isCameraOn && userMe.isScreenSharing) {
      //   turnOffLocalCamera(streamId);
      // } else {
      //   justTurnOnLocalCamera(streamId);
      // }
    };

    const toggleLocalCamera = () => {
      if (userMe.isCameraOn) {
        //si camara está on --> apago mi camara
        setCameraIconState(false);
        turnOffLocalCamera(streamId);
        setVideoActivatedState(false);
        setCameraState(false);
        sendNotificationEvent('CAM_TURNED_OFF', streamId);
      } else {
        //si camara no está on y el usuario estaba compartiendo pantalla
        //-> apagar pantalla y abrir camara
        if (userMe.isScreenSharing) {
          //switchDesktopCaptureWithCamera(streamId);
          setScreenState(false);
          setIDButtonSelected('');
          resetDesktop();
          sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
        }
        setVideoActivatedState(true);
        setCameraIconState(true);
        setCameraState(true);
        turnOnLocalCamera(streamId);
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
          const nowTime = moment().format('YYYY-MM-DD HH:mm');
          const haveStarted = moment(nowTime).isSameOrAfter(
            roomState.startDate
          );
          if (haveStarted || roleId === 0) {
            setExistRoom(true);
            createInstance(
              roomId,
              streamId,
              streamName,
              publishToken,
              playToken,
              subscriberId,
              subscriberCode
            );
          } else {
            setLoadingOrErrorMessage('This room have not started!');
          }

          // To review
          // setIsLoadingOrError(false);
        } else if (status === 404) {
          setLoadingOrErrorMessage('Room not found!');
        } else {
          setLoadingOrErrorMessage('Not Allowed!');
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
