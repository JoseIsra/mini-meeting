<template>
  <div class="t-cooperate">
    <fu-cooperate
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :webRTCAdaptor="webRTCAdaptor"
      :toggleDesktopCapture="toggleDesktopCapture"
      v-if="existRoom"
      @mounted="fuCooperateMountedHandler"
    />
    <fu-t-loading v-if="isLoadingOrError" :loadingMessage="loadingMessage" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import FuCooperate from 'organisms/FuCooperate';
import { useRoute } from 'vue-router';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { objWebRTC, WebRTCAdaptorType } from '@/types/index';
import { useToogleFunctions } from '@/composables';
import { Message, useHandleMessage } from '@/composables/chat';
import { User, useUserMe } from '@/composables/userMe';
import { ZoidWindow } from '@/types/zoid';
import { useHandleParticipants } from '@/composables/participants';
import FuTLoading from 'organisms/FuLoading';

interface StringIndexedArray<TValue> {
  [id: string]: TValue;
}

interface ObjInfoRequested {
  to: string;
  from: string;
}
interface Data {
  streamId: string;
  notificationType: string;
  eventType: string;
}

interface ObjRemoteUserInfo extends ObjInfoRequested {
  eventType: string;
  userInfo: User;
}

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
  },
  setup() {
    const { setUserMessage } = useHandleMessage();
    const { userMe, setUserMe, setScreenState, setVideoActivatedState } =
      useUserMe();
    const route = useRoute();
    const { addHandNotificationInfo, removeHandNotification } =
      useToogleFunctions();
    const {
      addParticipant,
      participants,
      setParticipants,
      deleteParticipantById,
    } = useHandleParticipants();

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

    setUserMe({
      id: streamId,
      name: streamName,
      avatar,
      isCameraOn: false,
      isMicOn: true,
      isScreenSharing: false,
      isVideoActivated: false,
    });

    const roomId =
      (window as ZoidWindow)?.xprops?.roomId ||
      (route.query.roomId as string) ||
      '';

    console.log(roomId, '#️⃣#️⃣');
    const publishToken =
      (window as ZoidWindow)?.xprops?.publishToken ||
      (route.query.publishToken as string) ||
      '';
    const playToken =
      (window as ZoidWindow)?.xprops?.playToken ||
      (route.query.playToken as string) ||
      '';

    /* const playOnly = ref(!!route.query.playOnly || false);
    const isCameraOff = ref(false); */
    const webRTCAdaptor = ref<WebRTCAdaptorType>({});

    const roomOfStream = ref<StringIndexedArray<string>>({});
    const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);
    const streamsList = ref<string[]>([]);
    // const objStreams = ref<objWebRTC[]>([]);
    const isDataChannelOpen = ref(false);

    // const isMicMuted = ref(false);
    const isMuteMicButtonDisabled = ref(false);
    const isUnmuteMicButtonDisabled = ref(true);
    const currentVolume = ref(0.5);

    const subscriberId = ref<string | undefined>(
      (route.query.subscriberId as string) || undefined
    );
    const subscriberCode = ref<string | undefined>(
      (route.query.subscriberCode as string) || undefined
    );

    //TODO: Get the device id in the websocket as it works in player.html
    let cameraId: string;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        let filtrado = devices.filter((x) => x.kind === 'videoinput')[0];
        cameraId = filtrado.deviceId;
      })
      .catch((err) => console.log(err));

    //TODO: Get the device id in the websocket as it works in player.html

    const toggleDesktopCapture = () => {
      if (userMe.isScreenSharing) {
        console.log('DESACTIVAO');
        webRTCAdaptor.value.resetDesktop?.();
        sendNotificationEvent('SCREEN_SHARING_OFF');
        console.log('6');
      }
      if (userMe.isCameraOn && !userMe.isScreenSharing) {
        webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
        webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(streamId);
        console.log('5');
      } else if (!userMe.isCameraOn && !userMe.isScreenSharing) {
        webRTCAdaptor.value.switchDesktopCapture?.(streamId);
        setVideoActivatedState(true);
        sendNotificationEvent('SCREEN_SHARING_ON');
        console.log('4');
      } else if (userMe.isCameraOn && userMe.isScreenSharing) {
        webRTCAdaptor.value.switchVideoCameraCapture?.(streamId, cameraId);
        console.log('3');
      }

      if (!userMe.isCameraOn && userMe.isScreenSharing) {
        webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
        console.log('2');
      } else {
        console.log('1');
        webRTCAdaptor.value.justTurnOnLocalCamera?.(streamId);
      }
    };

    const toggleLocalCamera = () => {
      if (userMe.isCameraOn) {
        if (userMe.isScreenSharing) {
          webRTCAdaptor.value.switchDesktopCapture?.(streamId);
        } else {
          webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
          sendNotificationEvent('CAM_TURNED_OFF');
        }
      } else {
        if (userMe.isScreenSharing) {
          webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(streamId);
        } else {
          webRTCAdaptor.value.turnOnLocalCamera?.(streamId);
        }
        sendNotificationEvent('CAM_TURNED_ON');
      }
    };
    const toggleLocalMic = () => {
      if (!userMe.isMicOn) {
        webRTCAdaptor.value.unmuteLocalMic?.();
        sendNotificationEvent('MIC_UNMUTED');
      } else {
        webRTCAdaptor.value.muteLocalMic?.();
        sendNotificationEvent('MIC_MUTED');
      }
    };

    const joinRoom = () => {
      webRTCAdaptor.value.joinRoom?.(roomId, streamId, 'legacy');
    };

    const publish = (
      streamId: string,
      token: string,
      subscriberId: string | undefined = undefined,
      subscriberCode: string | undefined = undefined,
      streamName: string | undefined = undefined
    ) => {
      streamId = streamId;
      webRTCAdaptor.value.publish?.(
        streamId,
        token,
        subscriberId,
        subscriberCode,
        streamName
      );
    };

    const removeRemoteVideo = (streamId: string) => {
      const newListOfParticipants = participants.filter(
        (participant) => participant.id !== streamId
      );
      console.log(newListOfParticipants, '*️⃣*️⃣*️⃣');
      deleteParticipantById(streamId);
      webRTCAdaptor.value.stop?.(streamId);

      console.log(participants, '*️⃣*️⃣');
    };

    const streamInformation = (obj: objWebRTC) => {
      webRTCAdaptor.value.play?.(obj.streamId, playToken, roomId);
    };

    const handleNotificationEvent = (obj: objWebRTC) => {
      console.log(obj);
      const notificationEvent = JSON.parse(obj.data) as Record<string, string>;
      if (notificationEvent != null && typeof notificationEvent == 'object') {
        const eventStreamId = notificationEvent.streamId;
        const eventTyp = notificationEvent.eventType;

        if (eventTyp == 'CAM_TURNED_OFF') {
          console.log('Camera turned off for : ', eventStreamId);
        } else if (eventTyp == 'CAM_TURNED_ON') {
          console.log('Camera turned on for : ', eventStreamId);
        } else if (eventTyp == 'MIC_MUTED') {
          console.log('Microphone muted for : ', eventStreamId);
        } else if (eventTyp == 'MIC_UNMUTED') {
          console.log('Microphone unmuted for : ', eventStreamId);
        }
      }
    };

    const sendNotificationEvent = (notificationType: string) => {
      if (isDataChannelOpen.value) {
        var notEvent = {
          streamId,
          notificationType,
          eventType: 'NOTIFICATION',
        };

        webRTCAdaptor.value.sendData?.(streamId, JSON.stringify(notEvent));
      } else {
        console.log(
          'Could not send the notification because data channel is not open.'
        );
      }
    };

    const changeVolume = () => {
      webRTCAdaptor.value.currentVolume = currentVolume.value;
      if (webRTCAdaptor.value.soundOriginGainNode != null) {
        webRTCAdaptor.value.soundOriginGainNode.gain.value =
          currentVolume.value;
      }
      if (webRTCAdaptor.value.secondStreamGainNode != null) {
        webRTCAdaptor.value.secondStreamGainNode.gain.value =
          currentVolume.value;
      }
    };

    const leaveRoom = () => {
      webRTCAdaptor.value.leaveFromRoom?.(roomId);

      setParticipants([]);
    };

    const createConnection = () => {
      const websocketURL = 'wss://dialguiba.tech/WebRTCAppEE/websocket';

      const mediaConstraints = {
        video: true,
        audio: true,
      };

      const pc_config = {
        iceServers: [
          {
            urls: 'stun:stun1.l.google.com:19302',
          },
        ],
      };

      const sdpConstraints = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false,
      };

      webRTCAdaptor.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        localVideoId: 'localVideo',
        isPlayMode: false,
        debug: true,
        dataChannelEnabled: true,
        initCameraState: userMe.isCameraOn,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            console.log('initialized');
            /* if (playOnly.value) {
              isCameraOff.value = false;
            } */
            // load all
            if (!userMe.isCameraOn) {
              webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
            }
            // load all
            joinRoom();
          } else if (info == 'joinedTheRoom') {
            /* var room = obj.ATTR_ROOM_NAME; */
            console.log('joined', obj);

            const room = obj.ATTR_ROOM_NAME;
            const streamId = obj.streamId;
            /* this.roomOfStream[obj.streamId] = room; */
            roomOfStream.value[obj.streamId] = room;
            console.log(`joined the room: ${room}`);

            /* if (playOnly.value) {
              isCameraOff.value = true;
            } else {
              } */
            publish(
              streamId,
              publishToken,
              subscriberId.value,
              subscriberCode.value,
              streamName
            );

            if (obj.streams != null) {
              //Por si hay salas a la hora de unirse aquí se añaden al array de participantes
              obj.streams.forEach(function (item) {
                console.log('🥲 Stream joined with ID: ' + item);
                webRTCAdaptor.value.play?.(item, playToken, roomId);
              });

              //streamsList.value = obj.streams;
              //participants = obj.streams;
            }
            roomTimerId.value = setInterval(() => {
              //Para obtener info de las salas cada cierto tiempo
              webRTCAdaptor.value.getRoomInfo?.(roomId, streamId);
            }, 2000);
          } else if (info == 'newStreamAvailable') {
            let isThere = participants.find((x) => x.id === obj.streamId);

            if (obj.streamId !== streamId) {
              if (isThere) {
                //isThere = obj;
                isThere = {
                  id: obj.streamId,
                  stream: obj.stream,
                };
              } else {
                addParticipant({ id: obj.streamId, stream: obj.stream });
              }
            }
          } else if (info == 'publish_started') {
            //stream is being published
            console.log('INICIO DE PUBBLISH 😁', obj, streamName);
            console.debug(
              'publish started to room: #️⃣' + roomOfStream.value[obj.streamId]
            );
          } else if (info == 'publish_finished') {
            //stream is being finished
            console.debug('publish finished');
          } else if (info == 'screen_share_stopped') {
            console.log('screen share stopped');
            setScreenState(false);
            if (!userMe.isCameraOn) {
              userMe.isVideoActivated = false;
              webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
            }
            webRTCAdaptor.value.resetDesktop?.();
          } else if (info == 'ScreenShareStarted') {
            setVideoActivatedState(true);
          } else if (info == 'browser_screen_share_supported') {
            //enable camera and screenshare

            console.log('browser screen share supported');
          } else if (info == 'leavedFromRoom') {
            console.log('ALGUIEN SALIOOOOOOOO');
            var room = obj.ATTR_ROOM_NAME;
            console.debug('leaved from the room:' + room);
            if (roomTimerId.value != null) {
              clearInterval(roomTimerId.value);
            }

            //TODO: este es el error por el que sale streamid que ya se está escuchando
            if (streamsList.value != null) {
              streamsList.value.forEach(function (item) {
                removeRemoteVideo(item);
              });
            }
            if (participants != null) {
              participants.forEach(function (participant) {
                removeRemoteVideo(participant.id as string);
              });
            }
            // we need to reset streams list
            setParticipants([]);
            streamsList.value = [];
          } else if (info == 'closed') {
            //console.log("Connection closed");
            if (typeof obj != 'undefined') {
              console.log('Connecton closed: ' + JSON.stringify(obj));
            }
          } else if (info == 'play_finished') {
            /* console.log('play_finished');
          removeRemoteVideo(obj.streamId); */
            removeRemoteVideo(obj.streamId);
          } else if (info == 'streamInformation') {
            streamInformation(obj);
          } else if (info == 'roomInformation') {
            //Checks if any new stream has added, if yes, plays.
            console.log(obj.streams);
            for (let str of obj.streams) {
              if (!streamsList.value.includes(str)) {
                webRTCAdaptor.value.play?.(str, playToken, roomId);
              }
            }
            for (let str of streamsList.value) {
              if (!obj.streams.includes(str)) {
                removeRemoteVideo(str);
              }
            }

            //Lastly updates the current streamlist with the fetched one.
            streamsList.value = obj.streams;
          } else if (info == 'data_channel_opened') {
            console.info('Data Channel open for stream id 🃏🃏🃏', obj);

            //Mandar petición de data de usuario a todos los usuarios con el que se abre un canal de comunicación

            const user = obj as unknown as string;
            console.log(user === userMe.id);

            if (user !== userMe.id) {
              console.info(
                '⭐ i am sending a petition requesting data to user',
                obj,
                'from:',
                userMe.id
              );

              webRTCAdaptor.value.sendData?.(
                userMe.id,
                JSON.stringify({
                  eventType: 'USER_INFO_REQUEST',
                  from: userMe.id,
                  to: obj,
                })
              );
            }

            isLoadingOrError.value = false;
            isDataChannelOpen.value = true;
          } else if (info == 'data_channel_closed') {
            console.log('Data Channel closed for stream id', obj);

            isDataChannelOpen.value = false;
          } else if (info == 'data_received') {
            //console.log(obj);
            const objParsed = JSON.parse(obj.data) as Message;
            const { eventType } = objParsed;
            if (eventType === 'CHAT_MESSAGE') {
              //console.log(objParsed);
              setUserMessage(objParsed);
            } else if (eventType === 'NOTIFICATION') {
              handleNotificationEvent(obj);
              const { notificationType } = JSON.parse(obj.data) as Data;
              console.log(notificationType);
              if (notificationType == 'CAM_TURNED_ON') {
                const streamID = obj.streamId;
                console.log(streamID);
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  console.log(user);
                  user.isCameraOn = true;
                  user.isVideoActivated = true;
                }
              } else if (notificationType == 'CAM_TURNED_OFF') {
                const streamID = obj.streamId;
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  user.isCameraOn = false;
                  user.isVideoActivated = false;
                }
              } else if (notificationType == 'SCREEN_SHARING_ON') {
                const streamID = obj.streamId;
                console.log(streamID);
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  console.log(user);
                  user.isScreenSharing = true;
                  user.isVideoActivated = true;
                }
              } else if (notificationType == 'SCREEN_SHARING_OFF') {
                const streamID = obj.streamId;
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  user.isScreenSharing = false;
                  user.isVideoActivated = false;
                }
              } else if (notificationType == 'MIC_UNMUTED') {
                const streamID = obj.streamId;
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  user.isMicOn = true;
                }
              } else if (notificationType == 'MIC_MUTED') {
                const streamID = obj.streamId;
                const user = participants.find(
                  (participant) => participant.id === streamID
                );
                if (user) {
                  user.isMicOn = false;
                }
              }
            } else if (eventType === 'HAND') {
              console.log('parseado', objParsed);
              addHandNotificationInfo(objParsed);
            } else if (eventType === 'NOHAND') {
              removeHandNotification(objParsed.streamId);
            } else if (eventType === 'USER_INFO_REQUEST') {
              const infoRequestParsed = JSON.parse(
                obj.data
              ) as ObjInfoRequested;
              console.log(
                '⭐ my info',
                infoRequestParsed.to,
                'is requested from:',
                infoRequestParsed.from
              );
              if (infoRequestParsed.to === userMe.id) {
                try {
                  webRTCAdaptor.value.sendData?.(
                    userMe.id,
                    JSON.stringify({
                      eventType: 'USER_INFO',
                      from: infoRequestParsed.to,
                      to: infoRequestParsed.from,
                      userInfo: userMe,
                    })
                  );
                } catch {
                  console.info(
                    'The connection is not established yet for sending a petition for INFO_REQUEST'
                  );
                }
              }
              console.log('my info have been sent');
              /* console.log(eventType, objParsed, userMe.id);
              webRTCAdaptor.value.sendData?.(
                userMe.id,
                JSON.stringify({ eventType: 'USER_INFO', ...userMe })
              ); */
              /*  */
              /*  */
              /*  */
              /* try {
                webRTCAdaptor.value.sendData?.(
                  userMe.id,
                  JSON.stringify({ eventType: 'USER_INFO', ...userMe })
                );
              } catch (e) {
                console.log(e);
              } */
              //console.log(objParsed, 'Recibe info del usuario 🇧🇼🇧🇼🇧🇼🇧🇼');
              //console.log(obj);
              //test.value.push(obj);
            } else if (eventType === 'USER_INFO') {
              //console.log(eventType, objParsed);
              const remoteUserInfoParsed = JSON.parse(
                obj.data
              ) as ObjRemoteUserInfo;
              //Recieving info from another user if is for me
              if (remoteUserInfoParsed.to === userMe.id) {
                console.log('I am receiving info from another user', objParsed);

                webRTCAdaptor.value.sendData?.(
                  userMe.id,
                  JSON.stringify({
                    eventType: 'USER_INFO_FINISH',
                    from: remoteUserInfoParsed.to,
                    to: remoteUserInfoParsed.from,
                    userInfo: userMe,
                  })
                );

                console.log(participants);

                const user = participants.find(
                  (participant) =>
                    participant.id === remoteUserInfoParsed.userInfo.id
                );
                //user = { avatar : remoteUserInfoParsed.userInfo.avatar ,...user}
                if (user) {
                  user.avatar = remoteUserInfoParsed.userInfo.avatar;
                  user.name = remoteUserInfoParsed.userInfo.name;
                  user.isCameraOn = remoteUserInfoParsed.userInfo.isCameraOn;
                  user.isMicOn = remoteUserInfoParsed.userInfo.isMicOn;
                  user.isScreenSharing =
                    remoteUserInfoParsed.userInfo.isScreenSharing;
                }
              }
            } else if (eventType === 'USER_INFO_FINISH') {
              //console.log(eventType, objParsed);
              const remoteUserInfoParsed = JSON.parse(
                obj.data
              ) as ObjRemoteUserInfo;
              //Recieving info from another user if is for me
              if (remoteUserInfoParsed.to === userMe.id) {
                console.log('I am receiving info from another user', objParsed);

                const user = participants.find(
                  (participant) =>
                    participant.id === remoteUserInfoParsed.userInfo.id
                );
                //user = { avatar : remoteUserInfoParsed.userInfo.avatar ,...user}
                if (user) {
                  user.avatar = remoteUserInfoParsed.userInfo.avatar;
                  user.name = remoteUserInfoParsed.userInfo.name;
                  user.isCameraOn = remoteUserInfoParsed.userInfo.isCameraOn;
                  user.isMicOn = remoteUserInfoParsed.userInfo.isMicOn;
                  user.isScreenSharing =
                    remoteUserInfoParsed.userInfo.isScreenSharing;
                }
              }

              console.log(participants);
            }
          }
        },
        callbackError: function (
          error: string,
          message: string /* error: string, message: string */
        ) {
          console.log(error, message);
          //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
          if (
            error.indexOf('publishTimeoutError') != -1 &&
            roomTimerId.value != null
          ) {
            clearInterval(roomTimerId.value);
          }

          console.log('error callback: ' + JSON.stringify(error));
          var errorMessage = JSON.stringify(error);
          if (typeof message != 'undefined') {
            errorMessage = message;
          }
          var errorMessage = JSON.stringify(error);
          if (error.indexOf('NotFoundError') != -1) {
            errorMessage =
              'Camera or Mic are not found or not allowed in your device.';
          } else if (
            error.indexOf('NotReadableError') != -1 ||
            error.indexOf('TrackStartError') != -1
          ) {
            errorMessage =
              'Camera or Mic is being used by some other process that does not not allow these devices to be read.';
          } else if (
            error.indexOf('OverconstrainedError') != -1 ||
            error.indexOf('ConstraintNotSatisfiedError') != -1
          ) {
            errorMessage =
              'There is no device found that fits your video and audio constraints. You may change video and audio constraints.';
          } else if (
            error.indexOf('NotAllowedError') != -1 ||
            error.indexOf('PermissionDeniedError') != -1
          ) {
            errorMessage = 'You are not allowed to access camera and mic.';
          } else if (error.indexOf('TypeError') != -1) {
            errorMessage = 'Video/Audio is required.';
          } else if (error.indexOf('UnsecureContext') != -1) {
            errorMessage =
              'Fatal Error: Browser cannot access camera and mic because of unsecure context. Please install SSL and access via https';
          } else if (error.indexOf('WebSocketNotSupported') != -1) {
            errorMessage =
              'Fatal Error: WebSocket not supported in this browser';
          } else if (error.indexOf('no_stream_exist') != -1) {
            //TODO: removeRemoteVideo(error.streamId);
          } else if (error.indexOf('data_channel_error') != -1) {
            errorMessage =
              'There was a error during data channel communication';
          } else if (error.indexOf('ScreenSharePermissionDenied') != -1) {
            errorMessage = 'You are not allowed to access screen share';
            console.log('hola diosito soy yo de nuevo 🥲');
            //screen_share_checkbox.checked = false;
            setScreenState(false);
            setVideoActivatedState(false);
            webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
            webRTCAdaptor.value.resetDesktop?.();
          }
          console.log(errorMessage);
          //alert(errorMessage);
        },
      }) as WebRTCAdaptorType;
    };

    const loadingMessage = ref('');
    const isLoadingOrError = ref(true);
    const existRoom = ref(false);

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
        body: (await res.json()) as Record<string, string>,
      };
    };

    /* conditionals */
    if (roomId) {
      checkRoom(roomId)
        .then((res) => {
          if (res.status === 200) {
            existRoom.value = true;
            console.log(res.body, '🅱️🅱️🅱️🅱️');
          } else if (res.status === 404) {
            loadingMessage.value = 'Meeting not found';
          } else if (res.status === 403) {
            loadingMessage.value = 'Not allowed';
          }
        })
        .catch((error) => console.log(error));
    } else {
      loadingMessage.value = 'Please, provide a room id';
    }

    //TODO: Dont dissapear loading until the host accept the user. Needed to implement logic for that (dont publish neither play streams)

    const fuCooperateMountedHandler = () => {
      createConnection();
    };

    onUnmounted(() => {
      leaveRoom();
    });

    window.addEventListener('unload', () => {
      leaveRoom();
    });

    return {
      webRTCAdaptor,
      fuCooperateMountedHandler,
      isLoadingOrError,
      loadingMessage,
      existRoom,
      currentVolume,
      roomId,
      joinRoom,
      isMuteMicButtonDisabled,
      isUnmuteMicButtonDisabled,
      changeVolume,
      leaveRoom,
      toggleLocalCamera,
      toggleLocalMic,
      toggleDesktopCapture,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
