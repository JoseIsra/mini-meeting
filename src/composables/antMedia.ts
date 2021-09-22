import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { useUserMe, User } from '@/composables/userMe';
import { useAuthState } from '@/composables/auth';
import { objWebRTC } from '@/types/index';
import { useHandleParticipants } from '@/composables/participants';
import { Message, useHandleMessage } from '@/composables/chat';
import { useToogleFunctions } from '@/composables';
import { ZoidWindow } from '@/types/zoid';
import { useRoom } from '@/composables/room';
const webRTCInstance = ref<WebRTCAdaptor>({} as WebRTCAdaptor);

const {
  userMe,
  setScreenState,
  setVideoActivatedState,
  lockUserActions,
  unlockUserActions,
} = useUserMe();
const { setIsLoadingOrError, setLoadingOrErrorMessage, setExistRoom } =
  useAuthState();
const { setRecorded } = useRoom();
const {
  deleteParticipantById,
  participants,
  addParticipants,
  deleteAllParticipants,
} = useHandleParticipants();
const { setUserMessage, deleteLoadingMessage } = useHandleMessage();
const { addHandNotificationInfo, removeHandNotification } =
  useToogleFunctions();

const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);
const isDataChannelOpen = ref(false);

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

interface ObjKickedEvent {
  eventType: string;
  to: string;
}

interface ObjBlockParticipantAction {
  id: string;
  streamId: string;
  participantId: string;
  eventType: string;
}

export function useInitWebRTC() {
  const joinRoom = (roomId: string, streamId: string) => {
    webRTCInstance.value.joinRoom?.(roomId, streamId, 'legacy');
  };

  const publish = (
    streamId: string,
    token?: string,
    subscriberId?: string,
    subscriberCode?: string,
    streamName?: string
  ) => {
    streamId = streamId;
    webRTCInstance.value.publish?.(
      streamId,
      token,
      subscriberId,
      subscriberCode,
      streamName
    );
  };

  const removeRemoteVideo = (streamId: string) => {
    deleteParticipantById(streamId);
  };

  const streamInformation = (
    obj: objWebRTC,
    roomId: string,
    playToken?: string
  ) => {
    webRTCInstance.value.play?.(
      obj.streamId,
      playToken,
      roomId,
      undefined,
      undefined,
      undefined
    );
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

  const leaveRoom = (roomId: string) => {
    webRTCInstance.value.leaveFromRoom?.(roomId);
    participants.value = [];
  };

  const createInstance = (
    roomId: string,
    streamId: string,
    streamName: string,
    publishToken?: string,
    playToken?: string,
    subscriberId?: string,
    subscriberCode?: string
  ) => {
    const websocketURL = `wss://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/websocket`;

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

    webRTCInstance.value = new WebRTCAdaptor({
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
          if (!userMe.isCameraOn) {
            webRTCInstance.value.turnOffLocalCamera?.(streamId);
          }
          joinRoom(roomId, streamId);
        } else if (info == 'joinedTheRoom') {
          window.addEventListener('unload', () => {
            leaveRoom(roomId);
          });
          /* var room = obj.ATTR_ROOM_NAME; */
          console.log('joined', obj);

          //const room = obj.ATTR_ROOM_NAME;
          const streamId = obj.streamId;
          /* this.roomOfStream[obj.streamId] = room; */
          //roomOfStream.value[obj.streamId] = room;
          /* console.log(`joined the room: ${room}`); */

          /* if (playOnly.value) {
            isCameraOff.value = true;
          } else {
            } */
          publish(
            streamId,
            publishToken,
            subscriberId,
            subscriberCode,
            streamName
          );

          /* if (obj.streams != null) {
            
            obj.streams.forEach(function (item) {
              console.log('🥲 Stream joined with ID: ' + item);
              webRTCAdaptor.value.play?.(item, playToken, roomId);
            });
            streamsList.value = obj.streams;              

            console.log(streamsList.value, 'streamslisttttttt');
          } */
          roomTimerId.value = setInterval(() => {
            webRTCInstance.value.getRoomInfo?.(roomId, streamId);
          }, 2000);
        } else if (info == 'newStreamAvailable') {
          let isThere = participants.value.find((x) => x.id === obj.streamId);

          if (obj.streamId !== streamId) {
            if (isThere) {
              //isThere = obj;
              isThere = {
                id: obj.streamId,
                stream: obj.stream,
              };
            } else {
              const isMerge = obj.streamId.split('-')[0] === 'm';

              // objStreams.value.push(obj);
              if (!isMerge)
                addParticipants({ id: obj.streamId, stream: obj.stream });
            }
          }
        } else if (info == 'publish_started') {
          /* console.debug(
            `publish started to room: #️⃣ ${roomOfStream.value[obj.streamId]}`
          ); */
          console.debug('publish started');
        } else if (info == 'publish_finished') {
          console.debug('publish finished');
        } else if (info == 'screen_share_stopped') {
          console.log('screen share stopped');
          setScreenState(false);
          if (!userMe.isCameraOn) {
            userMe.isVideoActivated = false;
            webRTCInstance.value.turnOffLocalCamera?.(streamId);
          }
          webRTCInstance.value.resetDesktop?.();
          sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
        } else if (info == 'ScreenShareStarted') {
          setVideoActivatedState(true);
        } else if (info == 'browser_screen_share_supported') {
          console.log('browser screen share supported');
        } else if (info == 'leavedFromRoom') {
          const room = obj.ATTR_ROOM_NAME;
          console.debug('leaved from the room:' + room);
          if (roomTimerId.value != null) {
            clearInterval(roomTimerId.value as NodeJS.Timeout);
          }

          //TODO: este es el error por el que sale streamid que ya se está escuchando
          if (participants.value.length !== 0) {
            deleteAllParticipants();
          }
          /* if (streamsList.value != null) { */
          /* this.streamsList.forEach(function (item) {
            removeRemoteVideo(item);
          }); */
          /* } */
          /* if (participants.value != null) {
            participants.forEach(function (participant) {
            removeRemoteVideo(partic);
          });
          } */
          // we need to reset streams list
          //participants.value = [];
          //streamsList.value = [];
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
          streamInformation(obj, roomId, playToken);
        } else if (info == 'roomInformation') {
          /* participants.value.forEach((previousParticipant) => {
            obj.streams.forEach((actualParticipant) => {
              if (previousParticipant.id !== actualParticipant) {
                removeRemoteVideo(previousParticipant.id);
              }
            });
          }); */

          //Checks if any new stream has added, if yes, plays.
          /* for (let str of obj.streams) {
            if (!streamsList.value.includes(str)) {
              webRTCAdaptor.value.play?.(str, playToken, roomId);
            }
          } */

          for (const str of obj.streams) {
            const participant = participants.value.filter(
              (participant) => participant.id === str
            )[0];
            //Si el participante es nuevo - play
            if (!participant) {
              webRTCInstance.value.play?.(
                str,
                playToken,
                roomId,
                undefined,
                undefined,
                undefined
              );
            }
            /* if (!participants.value.includes(str)) {
              webRTCAdaptor.value.play?.(str, playToken, roomId);
            } */
          }
          /* for (let str of streamsList.value) {
            if (!obj.streams.includes(str)) {
              removeRemoteVideo(str);
            }              
          } */
          participants.value.forEach((participant) => {
            if (!obj.streams.includes(participant.id as string)) {
              removeRemoteVideo(participant.id as string);
            }
          });

          //Lastly updates the current streamlist with the fetched one.
          /* streamsList.value = obj.streams; */
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

            webRTCInstance.value.sendData?.(
              userMe.id,
              JSON.stringify({
                eventType: 'USER_INFO_REQUEST',
                from: userMe.id,
                to: obj,
              })
            );
          }

          //isLoadingOrError.value = false;
          setIsLoadingOrError(false);
          isDataChannelOpen.value = true;
        } else if (info == 'data_channel_closed') {
          console.log('Data Channel closed for stream id', obj);
          isDataChannelOpen.value = false;
        } else if (info == 'data_received') {
          // console.log(obj);
          const objParsed = JSON.parse(obj.data) as Message;
          const { eventType } = objParsed;
          //console.log(objParsed);
          if (eventType === 'CHAT_MESSAGE') {
            //console.log(objParsed);
            const messageParsed = JSON.parse(obj.data) as Message;
            const { typeMessage } = messageParsed;
            if (typeMessage == 'image' || typeMessage == 'file') {
              deleteLoadingMessage(objParsed.streamId);
              setUserMessage(objParsed);
            } else {
              setUserMessage(objParsed);
            }
          } else if (eventType === 'NOTIFICATION') {
            handleNotificationEvent(obj);
            const { notificationType } = JSON.parse(obj.data) as Data;
            console.log(notificationType);
            if (notificationType == 'CAM_TURNED_ON') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                console.log(user);
                user.isCameraOn = true;
                user.isVideoActivated = true;
              }
            } else if (notificationType == 'CAM_TURNED_OFF') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                user.isCameraOn = false;
                user.isVideoActivated = false;
              }
            } else if (notificationType == 'SCREEN_SHARING_ON') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                user.isScreenSharing = true;
                user.isVideoActivated = true;
              }
            } else if (notificationType == 'SCREEN_SHARING_OFF') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                user.isScreenSharing = false;
                user.isVideoActivated = false;
              }
            } else if (notificationType == 'MIC_UNMUTED') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                user.isMicOn = true;
              }
            } else if (notificationType == 'MIC_MUTED') {
              const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamID
              );
              if (user) {
                user.isMicOn = false;
              }
            } else if (notificationType == 'RECORDING_STARTED') {
              setRecorded(true);
            } else if (notificationType == 'RECORDING_STOPPED') {
              setRecorded(false);
            }
          } else if (eventType === 'HAND') {
            addHandNotificationInfo(objParsed);
          } else if (eventType === 'NOHAND') {
            removeHandNotification(objParsed.streamId);
          } else if (eventType === 'USER_INFO_REQUEST') {
            const infoRequestParsed = JSON.parse(obj.data) as ObjInfoRequested;
            console.log(
              '⭐ my info',
              infoRequestParsed.to,
              'is requested from:',
              infoRequestParsed.from
            );
            if (infoRequestParsed.to === userMe.id) {
              try {
                webRTCInstance.value.sendData?.(
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

              webRTCInstance.value.sendData?.(
                userMe.id,
                JSON.stringify({
                  eventType: 'USER_INFO_FINISH',
                  from: remoteUserInfoParsed.to,
                  to: remoteUserInfoParsed.from,
                  userInfo: userMe,
                })
              );

              const user = participants.value.find(
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

              const user = participants.value.find(
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
          } else if (eventType === 'KICK') {
            const kickedEvent = JSON.parse(obj.data) as ObjKickedEvent;
            if (kickedEvent.to === 'all') {
              (window as ZoidWindow).xprops?.handleLeaveCall?.();
            }
          } else if (eventType === 'UNLOCK_PARTICIPANT_ACTION') {
            const lockData = JSON.parse(obj.data) as ObjBlockParticipantAction;

            if (lockData.participantId !== userMe.id) {
              return;
            }

            unlockUserActions();
          } else if (eventType === 'LOCK_PARTICIPANT_ACTION') {
            const lockData = JSON.parse(obj.data) as ObjBlockParticipantAction;

            if (lockData.participantId !== userMe.id) {
              return;
            }

            if (userMe.isMicOn) {
              userMe.isMicOn = false;
              muteLocalMic();
              sendNotificationEvent('MIC_MUTED', userMe.id);
            }

            if (userMe.isCameraOn) {
              userMe.isCameraOn = false;
              turnOffLocalCamera(userMe.id);
              sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
            }

            if (userMe.isScreenSharing) {
              userMe.isScreenSharing = false;
              resetDesktop();
              sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
            }

            lockUserActions();
          } else if (eventType === 'UNLOCK_EVERYONE_ACTION') {
            // Send notification
            unlockUserActions();
          } else if (eventType === 'LOCK_EVERYONE_ACTION') {
            // Send notification

            if (userMe.isMicOn) {
              userMe.isMicOn = false;
              muteLocalMic();
              sendNotificationEvent('MIC_MUTED', userMe.id);
            }

            if (userMe.isCameraOn) {
              userMe.isCameraOn = false;
              turnOffLocalCamera(userMe.id);
              sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
            }

            if (userMe.isScreenSharing) {
              userMe.isScreenSharing = false;
              resetDesktop();
              sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
            }

            lockUserActions();
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
          clearInterval(roomTimerId.value as NodeJS.Timeout);
        }

        console.log('error callback: ' + JSON.stringify(error));

        let errorMessage = JSON.stringify(error);

        if (typeof message != 'undefined') {
          errorMessage = message;
        }

        errorMessage = JSON.stringify(error);

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
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
        } else if (error.indexOf('WebSocketNotSupported') != -1) {
          errorMessage = 'Fatal Error: WebSocket not supported in this browser';
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
        } else if (error.indexOf('no_stream_exist') != -1) {
          //TODO: removeRemoteVideo(error.streamId);
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
        } else if (error.indexOf('data_channel_error') != -1) {
          errorMessage = 'There was a error during data channel communication';
        } else if (error.indexOf('ScreenSharePermissionDenied') != -1) {
          errorMessage = 'You are not allowed to access screen share';
          console.log('hola diosito soy yo de nuevo 🥲');
          //screen_share_checkbox.checked = false;
          setScreenState(false);
          setVideoActivatedState(false);
          webRTCInstance.value.turnOffLocalCamera?.(streamId);
          webRTCInstance.value.resetDesktop?.();
        }

        console.log(errorMessage, '#️⃣');
        //alert(errorMessage);
      },
    });
  };

  const sendData = (streamId: string, objData: unknown) => {
    const data = JSON.stringify(objData);
    webRTCInstance.value.sendData?.(streamId, data);
  };

  const turnOffLocalCamera = (streamId: string) => {
    webRTCInstance.value.turnOffLocalCamera?.(streamId);
  };

  const switchDesktopCaptureWithCamera = (streamId: string) => {
    webRTCInstance.value.switchDesktopCaptureWithCamera?.(streamId);
  };

  const switchDesktopCapture = (streamId: string) => {
    webRTCInstance.value.switchDesktopCapture?.(streamId);
  };

  //TODO: Get the device id in the websocket as it works in player.html
  const switchVideoCameraCapture = (streamId: string) => {
    let cameraId: string;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const filtrado = devices.filter((x) => x.kind === 'videoinput')[0];
        cameraId = filtrado.deviceId;
        webRTCInstance.value.switchVideoCameraCapture?.(streamId, cameraId);
      })
      .catch((err) => console.log(err));
  };

  const resetDesktop = () => {
    webRTCInstance.value.resetDesktop?.();
  };

  const turnOnLocalCamera = (streamId: string) => {
    webRTCInstance.value.turnOnLocalCamera?.(streamId);
  };

  const unmuteLocalMic = () => {
    webRTCInstance.value.unmuteLocalMic?.();
  };

  const muteLocalMic = () => {
    webRTCInstance.value.muteLocalMic?.();
  };

  const sendNotificationEvent = (
    notificationType: string,
    streamId: string,
    state?: boolean
  ) => {
    if (isDataChannelOpen.value) {
      const notEvent = {
        streamId,
        notificationType,
        eventType: 'NOTIFICATION',
        state,
      };

      webRTCInstance.value.sendData?.(streamId, JSON.stringify(notEvent));
    } else {
      console.log(
        'Could not send the notification because data channel is not open.'
      );
    }
  };

  const justTurnOnLocalCamera = (streamId: string) => {
    webRTCInstance.value.justTurnOnLocalCamera?.(streamId);
  };

  const metodoDePrueba = (): MediaStream => {
    return webRTCInstance.value.metodoDePrueba?.() as MediaStream;
  };

  return {
    createInstance,
    sendData,
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
    metodoDePrueba,
  };
}
