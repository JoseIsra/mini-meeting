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
/* import { useActions } from '@/composables/actions'; */
import { useToogleFunctions } from '@/composables';
import moment from 'moment';

import { RoomApiBody } from '@/types/antmediaApi';

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
      publish,
      stopPublishing,
    } = useInitWebRTC();

    const {
      userMe,
      setUserMe,
      setVideoActivatedState,
      // setMicState,
      setCameraState,
      setScreenState,
      updateUserMe,
    } = useUserMe();

    const { roomState, setRoom } = useRoom();

    const route = useRoute();

    const {
      authState,
      setLoadingOrErrorMessage,
      setExistRoom,
      // setIsLoadingOrError,
    } = useAuthState();

    /* const { setMicIconState, setCameraIconState } = useActions(); */

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

    const cameraId =
      window.xprops?.cameraId || (route.query.cameraId as string);
      
    const micId = window.xprops?.micId || (route.query.micId as string);

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

    if (isHost) {
      window?.xprops?.setHostId?.(streamId);
    }

    const hostId = window?.xprops?.hostId as string;
    console.log(hostId, '🌏HOST ID🌏🌏');

    let bgInfo = window?.xprops?.bgInfo || {
      url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
      maximized: false,
      allowResetBg: false,
    };
    if (window?.xprops?.bgInfo?.url === '' || !window?.xprops?.bgInfo?.url) {
      bgInfo = {
        url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
        maximized: false,
        allowResetBg: false,
      };
    }

    const userPinnedZoid = (window?.xprops?.pinnedUser as string) || '';

    const isBeingRecorded = window?.xprops?.isBeingRecorded || false;

    const { setIDButtonSelected, setFullScreen } = useToogleFunctions();

    if (isCameraOn) {
      setVideoActivatedState(true);
      setCameraState(true);
      /* setCameraIconState(true); */
    }

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
      denied: Boolean(roomRestriction)
        ? roleId === 1
          ? PERMISSION_STATUS.asked
          : PERMISSION_STATUS.admitted
        : PERMISSION_STATUS.admitted,
      isRecording: false,
      isHost,
      cameraId,
      micId,
      isPublishing: isHost ? 1 : 0,
    });

    /* setMicIconState(isMicLocked ? false : isMicOn); */
    // setCameraIconState(!isCameraLocked);
    // setScreenShareIconState(!isScreenShareLocked);

    const startDate = window.xprops?.startDate || '2020-01-11 11:23';

    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      roomRestriction: roleId === 1 ? Boolean(roomRestriction) : false,
      isMicBlocked: isMicLocked,
      isCameraBlocked: isCameraLocked,
      isScreenShareBlocked: isScreenShareLocked,
      bgInfo: bgInfo,
      isBeingRecorded,
      recordingUrl: '',
      pinnedUser: null,
      pinnedUserId: userPinnedZoid,
      startDate,
      hostId,
    });

    /* setMicIconState(roleId === 1 ? (isMicLocked ? false : isMicOn) : isMicOn); */

    if (roleId === 1 ? (isCameraLocked ? false : isCameraOn) : isCameraOn) {
      setVideoActivatedState(true);
      /* setCameraIconState(true); */
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
        if (!userMe.isHost && !userMe.isMicOn && !userMe.isCameraOn) {
          updateUserMe({ isPublishing: 0 });
          stopPublishing(userMe.id);
        }
      } else {
        if (userMe.isCameraOn) {
          //apagar camara y prender captura
          /* setCameraIconState(false); */
          setCameraState(false);
          turnOffLocalCamera(streamId);
          sendNotificationEvent('CAM_TURNED_OFF', streamId);
          if (!userMe.isHost && !userMe.isMicOn && !userMe.isScreenSharing) {
            updateUserMe({ isPublishing: 0 });
            stopPublishing(userMe.id);
          }
        }

        if (userMe.isPublishing == 1) {
          switchDesktopCapture(streamId);
          setVideoActivatedState(true);
          setScreenState(true);
          sendNotificationEvent('SCREEN_SHARING_ON', streamId);
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);
          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              /* setMicIconState(true); */
              switchDesktopCapture(streamId);
              setVideoActivatedState(true);
              setScreenState(true);
              sendNotificationEvent('SCREEN_SHARING_ON', streamId);
            }
          }, 1000);
        }
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
        /* setCameraIconState(false); */
        turnOffLocalCamera(streamId);
        setVideoActivatedState(false);
        setCameraState(false);
        sendNotificationEvent('CAM_TURNED_OFF', streamId);
        if (!userMe.isHost && !userMe.isMicOn && !userMe.isScreenSharing) {
          updateUserMe({ isPublishing: 0 });
          stopPublishing(userMe.id);
        }
      } else {
        //si camara no está on y el usuario estaba compartiendo pantalla
        //-> apagar pantalla y abrir camara
        if (userMe.isScreenSharing) {
          //switchDesktopCaptureWithCamera(streamId);
          if (userMe.isPublishing == 1) {
            setScreenState(false);
            setIDButtonSelected('');
            resetDesktop();
            if (!userMe.isHost && !userMe.isMicOn && !userMe.isCameraOn) {
              updateUserMe({ isPublishing: 0 });
              stopPublishing(userMe.id);
              sendNotificationEvent('SCREEN_SHARING_OFF', roomState.hostId);
            }
          } else {
            updateUserMe({ isPublishing: 2 });
            publish(userMe.id, undefined, undefined, undefined, userMe.name);
            const interval = setInterval(() => {
              if (userMe.isPublishing == 1) {
                clearInterval(interval);
                setScreenState(false);
                setIDButtonSelected('');
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', roomState.hostId);
                if (!userMe.isHost && !userMe.isMicOn && !userMe.isCameraOn) {
                  updateUserMe({ isPublishing: 0 });
                  stopPublishing(userMe.id);
                }
              }
            }, 1000);
          }
        }
        if (userMe.isPublishing == 1) {
          setVideoActivatedState(true);
          /* setCameraIconState(true); */
          setCameraState(true);
          turnOnLocalCamera(streamId);
          console.log(userMe.stream, '⭕⭕⭕');
          sendNotificationEvent('CAM_TURNED_ON', roomState.hostId);
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);

          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              setVideoActivatedState(true);
              /* setCameraIconState(true); */
              setCameraState(true);
              turnOnLocalCamera(streamId);
              sendNotificationEvent('CAM_TURNED_ON', roomState.hostId);
              console.log(userMe.stream, '⭕⭕⭕');
            }
          }, 1000);
        }
      }
    };

    const toggleLocalMic = () => {
      if (!userMe.isMicOn) {
        if (userMe.isPublishing == 1) {
          /* setMicIconState(true); */
          unmuteLocalMic();
          sendNotificationEvent('MIC_UNMUTED', roomState.hostId);
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);
          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              /* setMicIconState(true); */
              unmuteLocalMic();
              sendNotificationEvent('MIC_UNMUTED', roomState.hostId);
            }
          }, 1000);
        }
      } else {
        /* setMicIconState(false); */
        muteLocalMic();
        sendNotificationEvent('MIC_MUTED', roomState.hostId);
        if (!userMe.isHost && !userMe.isVideoActivated) {
          updateUserMe({ isPublishing: 0 });
          stopPublishing(userMe.id);
        }
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
    const waitFor = (delay: number) =>
      new Promise((resolve) => setTimeout(resolve, delay));

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

      await waitFor(1300); //Solo está para que le de tiempo al host para eliminar los participantes que no están. Por ej, si un usuario recarga la página para que no aparezca repetido.

      return {
        status: res.status,
        message: res.statusText,
        body:
          res.status === 200
            ? ((await res.json()) as RoomApiBody)
            : ({} as RoomApiBody),
      };
    };

    onMounted(async () => {
      if (roomId) {
        const { status, body } = await checkRoom(roomId);
        if (status === 200) {
          const nowTime = moment().format('YYYY-MM-DD HH:mm');
          const haveStarted = moment(nowTime).isSameOrAfter(
            roomState.startDate
          );
          if (haveStarted || roleId === 0) {
            //El host puede ingresar a la reunión aún si no ha iniciado (Según la db de fractal).
            if (!body.roomStreamList.includes(userMe.id)) {
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
              setLoadingOrErrorMessage('Ya te encuentras en la reunión');
            }
          } else {
            setLoadingOrErrorMessage('La conferencia aún no ha iniciado');
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
      if (userMe.isHost) {
        console.debug(
          'asistencia registrada (login) con el siguiente id: ',
          userMe.fractalUserId
        );
        window.xprops?.logJoined?.(userMe.fractalUserId);
      }
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
