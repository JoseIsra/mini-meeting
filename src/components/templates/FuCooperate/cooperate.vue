<template>
  <div class="t-cooperate">
    <div
      class="t-cooperate__page"
      v-if="existRoom && isLoadingOrError === false"
    >
      <fu-lobby
        v-if="roomState.privacy"
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
import { User, useUserMe } from '@/composables/userMe';
import FuTLoading from 'organisms/FuLoading';
import { PERMISSION_STATUS, REASON_TO_LEAVE_ROOM } from '@/utils/enums';
import { useInitWebRTC } from '@/composables/antMedia';
import { useAuthState } from '@/composables/auth';
import { useRoom } from '@/composables/room';
import { useActions } from '@/composables/actions';
import { useToogleFunctions } from '@/composables';
import moment from 'moment';
import { useHandleParticipants } from '@/composables/participants';

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

    const { admittedParticipants } = useHandleParticipants();

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

    const privacy =
      window.xprops?.roomRestriction ||
      (route.query.roomRestriction as string) === '1' ||
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

    const isHost =
      window?.xprops?.isHost ||
      (JSON.parse((route.query.isHost as string) || 'false') as boolean);

    const bgUrl =
      (window?.xprops?.bgUrl as string) ||
      'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png';

    const userPinnedZoid = (window?.xprops?.pinnedUser as string) || '';

    const isBeingRecorded = window?.xprops?.isBeingRecorded;

    const { setIDButtonSelected, setFullScreen } = useToogleFunctions();

    if (isCameraOn) {
      setVideoActivatedState(true);
      setCameraState(true);
      setCameraIconState(true);
    }

    setUserMe({
      id: streamId,
      name: streamName,
      avatar,
      roleId,
      isMicOn: isMicOn ? true : isMicLocked,
      // isMicOn: !isMicLocked,
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
      isHost,
    });

    setMicIconState(isMicLocked ? false : isMicOn);
    // setCameraIconState(!isCameraLocked);
    // setScreenShareIconState(!isScreenShareLocked);

    const startDate = window.xprops?.startDate || '2020-01-11 11:23';

    const userPinned = admittedParticipants.value.find(
      (part) => part.id === userPinnedZoid
    );

    console.log('Id: ', userPinnedZoid);

    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      privacy: roleId === 1 ? privacy : false,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
      bgUrl: bgUrl,
      bgMaximixed: false,
      isBeingRecorded,
      pinnedUser: (userPinned as User) ?? null,
      pinnedUserId: userPinnedZoid,
      startDate,
    });

    if (userPinnedZoid) {
      setFullScreen('user');
      // setFullScreenObject(userPinned as User);
    }

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
