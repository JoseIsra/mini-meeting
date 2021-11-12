import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { objWebRTC, User } from '@/types/index';

import {
  REASON_TO_LEAVE_ROOM,
  LOCK_ACTION_TYPE,
  USER_ROLE,
  BOARD_EVENTS,
  MAIN_VIEW_LOCKED_TYPE,
  MAIN_VIEW_MODE,
  LOG_TYPE,
  PERMISSION_STATUS,
} from '@/utils/enums';

import {
  useToogleFunctions,
  useUserMe,
  useStreams,
  useAuthState,
  useRoom,
  useExternalVideo,
  useHandleMessage,
  useHandleParticipants,
} from '@/composables';

import { useBoard } from '@/composables/board';

import { useMainView } from '@/composables/mainView';

import { notifyWithAction, warningMessage } from '@/utils/notify';

import videojs from 'video.js';
/* import { useActions } from '@/composables/actions'; */
import _ from 'lodash';
/*  */
import {
  ExternalVideoObject,
  ObjAnswerPermission,
  ObjBlockEveryoneAction,
  ObjBlockParticipantAction,
  ObjKickedEvent,
  ObjRemoteUserInfo,
  ObjUserLeavingMessageParsed,
  ObjBoardEvent,
  VideoID,
  backgroundInfo,
  backgroundSize,
  BaseMessage,
  BaseData,
  Message,
  Notification,
  HandNotification,
  stopPlayingStream,
  MainViewState,
} from '@/types';

const webRTCInstance = ref<WebRTCAdaptor>({} as WebRTCAdaptor);

const {
  userMe,
  setScreenState,
  setVideoActivatedState,
  updateUserMe,
  setMicState,
  setCameraState,
  setLocalMicBlock,
  setLocalScreenShareBlock,
  setLocalVideoBlock,
  setDenied,
  toggleDrawState,
} = useUserMe();

const {
  streams,
  addStream,
  updateStreamById,
  findStreamById,
  removeStreamById,
} = useStreams();

const { setIsLoadingOrError, setLoadingOrErrorMessage, setExistRoom } =
  useAuthState();
const {
  updateRoom,
  setRoomMicState,
  setRoomCameraState,
  setRoomScreenShareState,
  updateBgUrl,
  updateBgSize,
  updateBoardState,
  roomState,
} = useRoom();

const {
  mainViewState,
  updateMainViewState,
  removePinnedUserForAll,
  removePinnedUser,
} = useMainView();

const {
  deleteParticipantById,
  participants,
  addParticipant,
  updateParticipantDenied,
  admittedParticipants,
  updateParticipantById,
  setEveryParticipantActions,
  setParticipantActions,
} = useHandleParticipants();

const { setUserMessage, amountOfNewMessages, acumulateMessages } =
  useHandleMessage();

const {
  addHandNotificationInfo,
  removeHandNotification,
  functionsOnMenuBar,
  updateHandNotification,
} = useToogleFunctions();

const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);

const { updateExternalVideoState, externalVideo } = useExternalVideo();

/* const { setScreenShareIconState } = useActions(); */

const { handleMultipleObjects, clearBoard, changeBgColor, discardSelection } = useBoard();

const remotePlayer = ref<videojs.Player>({} as videojs.Player);

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
    webRTCInstance.value.publish?.(
      streamId,
      token,
      subscriberId,
      subscriberCode,
      streamName
    );
  };

  const removeRemoteVideo = (streamId: string) => {
    removeStreamById(streamId);
    deleteParticipantById(streamId);
    console.log('removing participant 🛕');
  };

  const handleNotificationMessage = (
    notificationType: string,
    baseData: Notification
  ) => {
    const { streamId } = baseData;

    const notificationHandler: Record<string, () => void> = {
      CAM_TURNED_ON: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isCameraOn = true;
          user.isVideoActivated = true;
        }
      },
      CAM_TURNED_OFF: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isCameraOn = false;
          user.isVideoActivated = false;
          /*  */
          if (!user?.isHost && !user?.isMicOn)
            updateStreamById(user?.id, { isBeingPlayed: false });
        }
      },
      SCREEN_SHARING_ON: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isScreenSharing = true;
          user.isVideoActivated = true;
        }
      },
      SCREEN_SHARING_OFF: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isScreenSharing = false;
          user.isVideoActivated = false;
          /*  */
          if (!user?.isHost && !user?.isMicOn)
            updateStreamById(user?.id, { isBeingPlayed: false });
        }
      },
      MIC_UNMUTED: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isMicOn = true;
        }
      },
      MIC_MUTED: function () {
        const user = participants.value.find(
          (participant) => participant.id === streamId
        );
        if (user) {
          user.isMicOn = false;
          if (!user?.isHost && !user?.isVideoActivated)
            updateStreamById(user?.id, { isBeingPlayed: false });
        }
      },
      RECORDING_STARTED: function () {
        updateRoom({ isBeingRecorded: true });
        warningMessage('Iniciando grabación de la sala');
      },
      RECORDING_STOPPED: function () {
        updateRoom({ isBeingRecorded: false });
        warningMessage('Grabación de la sala terminada');
      },
      DEFAULT: function () {
        console.log('DEFAULT');
      },
    };
    return (
      notificationHandler[notificationType] || notificationHandler['default']
    )();
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
          urls: 'stun:40.117.182.253:3478',
          username: 'fuantmedia',
          credential: 'fuantmedia',
        },
      ],
    };

    const sdpConstraints = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false,
    };

    const playExternalVideo = (arg: ExternalVideoObject) => {
      remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);
      void remotePlayer.value.play();
    };

    const pauseExternalVideo = (arg: ExternalVideoObject) => {
      remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);
      void remotePlayer.value.pause();
    };
    const updateVideoTime = (arg: ExternalVideoObject) => {
      remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);
      //actualizar el video
      void remotePlayer.value.currentTime(arg.videoCurrentTime as number);
    };

    const initRemotePlayerInstance = (arg: ExternalVideoObject) => {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.VIDEO,
        locked: MAIN_VIEW_LOCKED_TYPE.NORMAL_USERS,
        startedBy: userMe.id,
      });
      updateExternalVideoState({
        ...externalVideo,
        urlVideo: arg.urlVideo,
      });
      setTimeout(() => {
        remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);

        setTimeout(() => {
          remotePlayer.value.currentTime(arg.videoCurrentTime as number);
          if (!arg.isVideoPlaying) {
            remotePlayer.value.pause();
          }
        }, 500);
      }, 1000);
    };

    const removeVideoShared = (arg: ExternalVideoObject) => {
      remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);
      videojs((arg.remoteInstance as VideoID).playerId).dispose();
      updateMainViewState({
        mode: MAIN_VIEW_MODE.NONE,
      });
      updateExternalVideoState({
        ...externalVideo,
        videoOnRoom: false,
        urlVideo: '',
        remoteInstance: {} as HTMLMediaElement & { playerId: string },
        isVideoPlaying: false,
        videoCurrentTime: 0,
      });
    };

    webRTCInstance.value = new WebRTCAdaptor({
      websocket_url: websocketURL,
      mediaConstraints: mediaConstraints,
      peerconnection_config: pc_config,
      sdp_constraints: sdpConstraints,
      isPlayMode: userMe.isHost ? false : false,
      debug: true,
      dataChannelEnabled: true,
      callback: (info: string, obj: objWebRTC) => {
        if (info == 'initialized') {
          console.debug('initialized');

          const localStream = webRTCInstance.value.getLocalStream?.();

          updateUserMe({ stream: localStream });

          joinRoom(roomId, streamId);
        } else if (info == 'joinedTheRoom') {
          if (!userMe.isCameraOn) {
            webRTCInstance.value.turnOffLocalCamera?.(streamId);
          }
          if (!userMe.isMicOn) {
            muteLocalMic();
          }

          window.addEventListener('unload', () => {
            /* sendData(roomState.hostId, {
              eventType: 'USER_LEAVING',
              id: userMe.id,
              fractalUserId: userMe.fractalUserId,
            }); */

            //TODO: Pass this when user leave in fetch
            /* if (roomState.pinnedUser?.id === userMe.id) {
              sendData(roomState.hostId, {
                eventType: 'SET_FULL_SCREEN',
                mode: 'none',
              });
            } */

            //TODO: Pass this when user leave in fetch
            /* if (userMe.isRecording) {
              const idUserGoingToStopRec =
                admittedParticipants.value.filter(
                  (participant) => participant.roleId === 0
                )?.[0].id || admittedParticipants.value[0].id;

              if (idUserGoingToStopRec)
                sendNotificationEvent('RECORDING_STOPPED', userMe.id, {
                  to: idUserGoingToStopRec,
                });
            } */

            try {
              leaveRoom(roomId);
              stopPublishing(userMe.id);
            } catch (e) {
              console.log(e);
            }
          });

          if (userMe.isHost) {
            publish(
              streamId,
              publishToken,
              subscriberId,
              subscriberCode,
              streamName
            );
          }

          roomTimerId.value = setInterval(() => {
            webRTCInstance.value.getRoomInfo?.(roomId, streamId);
          }, 2000);
        } else if (info == 'newStreamAvailable') {
          console.debug('New stream available', obj);

          const isThere = participants.value.find((x) => x.id === obj.streamId);

          if (obj.streamId !== streamId) {
            if (isThere) {
              //isThere = obj;
              /* isThere = {
                id: obj.streamId,
                stream: obj.stream,
              }; */
              isThere.stream = obj.stream;
            } else {
              const isMerge = obj.streamId.split('-')[0] === 'm';
              if (!isMerge)
                addParticipant({
                  id: obj.streamId,
                  stream: obj.stream,
                } as User);
            }
          }
        } else if (info == 'publish_started') {
          console.debug('publish started');
          if (userMe.isHost) {
            updateUserMe({ isPublishing: 1 });
          }
        } else if (info == 'publish_finished') {
          console.debug('publish finished');
        } else if (info == 'screen_share_stopped') {
          console.debug('screen share stopped');
          updateUserMe({ isScreenSharing: false });
          turnOffLocalCamera(streamId);
          resetDesktop();
          if (
            !userMe.isCameraOn &&
            !userMe.isMicOn &&
            !userMe.isHost &&
            !userMe.isRecording
          ) {
            stopPublishing(streamId);
            updateUserMe({ isPublishing: 0 });
          }
          if (!userMe.isCameraOn) {
            updateUserMe({ isVideoActivated: false });
          }
          sendNotificationEvent('SCREEN_SHARING_OFF', streamId);
        } else if (info == 'screen_share_started') {
          /* setVideoActivatedState(true);
          setScreenState(true); */
          updateUserMe({ isScreenSharing: true, isVideoActivated: true });
          if (userMe.isCameraOn) {
            setCameraState(false);
            setScreenState(true);
            sendNotificationEvent('SCREEN_SHARING_ON', streamId);
          } else {
            setScreenState(true);
            setVideoActivatedState(true);
            sendNotificationEvent('SCREEN_SHARING_ON', streamId);
          }
        } else if (info == 'browser_screen_share_supported') {
          console.log('browser screen share supported');
        } else if (info == 'leavedFromRoom') {
          const room = obj.ATTR_ROOM_NAME;
          console.debug('leaved from the room:' + room);
          if (roomTimerId.value != null) {
            clearInterval(roomTimerId.value as NodeJS.Timeout);
          }
        } else if (info == 'closed') {
          console.debug('Connection closed');

          if (typeof obj != 'undefined') {
            console.log('Connecton closed: ' + JSON.stringify(obj));
          }
        } else if (info == 'play_finished') {
          console.debug('play finished');
        } else if (info == 'streamInformation') {
          console.debug('stream information received');
        } else if (info == 'roomInformation') {
          /* for (const playedStream of playedStreams.value) {
            if (!obj.streams.includes(playedStream)) {
              const elementIndex = playedStreams.value.indexOf(playedStream);
              playedStreams.value.splice(elementIndex, 1);
            }
          } */

          for (const str of obj.streams) {
            /* const participant = participants.value.filter(
              (participant) => participant.id === str
            )[0]; */
            const isMerge = str.split('-')[0] === 'm';

            /* if (!participant?.isBeingPlayed && str === roomState.hostId) {
              console.log('i am gonna play: ', participant?.id);
              webRTCInstance.value.play?.(
                str,
                playToken,
                roomId,
                undefined,
                undefined,
                undefined
              );
              if (participant) {
                updateParticipantById(participant.id as string, {
                  isBeingPlayed: true,
                });
              }
            } */

            if (!isMerge) {
              try {
                //playedStreams.value.push(str);

                const streamFound = findStreamById(str);
                if (streamFound) {
                  if (!streamFound.isBeingPlayed) {
                    console.debug('⭐⭐⭐ trying to play: ', str);
                    /* setTimeout(() => { */
                    webRTCInstance.value.play?.(
                      str,
                      playToken,
                      roomId,
                      undefined,
                      undefined,
                      undefined
                    );
                    /* }, 500); */
                    //updateStreamById(str, { isBeingPlayed: true });
                    /* addStream({ id: str }); */
                  }
                } else {
                  webRTCInstance.value.play?.(
                    str,
                    playToken,
                    roomId,
                    undefined,
                    undefined,
                    undefined
                  );
                  addStream({ id: str });
                }
              } catch (e) {
                updateStreamById(str, { isBeingPlayed: false });
                console.error(e);
              }
            }
          }

          for (const stream of streams) {
            if (
              !obj.streams.includes(stream.id as string) &&
              userMe.id !== stream.id
            ) {
              if (stream.isBeingPlayed) {
                webRTCInstance.value.stop(stream.id as string);
                updateStreamById(stream.id as string, { isBeingPlayed: false });
                sendData(roomState.hostId, {
                  evenType: 'STOP_PLAYING_STREAM',
                  from: userMe.id,
                  to: 'ALL',
                  streamToPause: stream.id,
                });
              }
            }
          }
        } else if (info == 'data_channel_opened') {
          console.info('Data Channel open for stream id 🃏🃏🃏', obj);

          const user = obj as unknown as string;

          if (roomState.hostId == user) {
            /* if (userMe.isMicOn || userMe.isCameraOn) {
              publish(
                streamId,
                publishToken,
                subscriberId,
                subscriberCode,
                streamName
              );
            } */

            // Solo si es el host
            if (userMe.isHost) {
              setInterval(() => {
                fetch(
                  `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/conference-rooms/${roomState.id}`
                )
                  .then(async (res) => {
                    const body = (await res.json()) as unknown as Record<
                      string,
                      string
                    >;

                    const currentParticipants = body.roomStreamList;
                    const offlineParticipants: string[] = [];

                    for (const participant of admittedParticipants.value) {
                      /* Loguear la entrada */
                      const isMerge = participant.id?.split('-')[0] === 'm';
                      const isRetransmission =
                        participant.id?.split('-')[0] === 'r';
                      if (
                        currentParticipants.includes(participant.id) &&
                        !isMerge &&
                        !isRetransmission &&
                        !participant.hasLogJoin
                      ) {
                        console.debug(
                          `🏃‍♂️ Registrando entrada del usuario: ${participant.name} ${participant.id}`
                        );
                        window.xprops?.logJoined?.(participant?.fractalUserId);
                        updateParticipantById(participant?.id, {
                          hasLogJoin: true,
                        });
                      }

                      /* Loguear la salida y sacar usuarios de la sala */
                      if (
                        !currentParticipants.includes(participant.id) &&
                        !isMerge &&
                        !isRetransmission
                      ) {
                        offlineParticipants.push(participant.fractalUserId);
                      }
                    }
                    //Remueve de la lista de participantes general cuando alguien se va
                    for (const participant of participants.value) {
                      if (!currentParticipants.includes(participant.id)) {
                        /* if (roomState.pinnedUser?.id === participant.id) {
                          setFullScreen('none', false);
                          clearFullScreenObject();
                          updateRoom({ pinnedUser: null });
                          window.xprops?.setPinnedUser?.('');
                        } */
                        if (
                          mainViewState.pinnedUsers.includes(participant.id)
                        ) {
                          if (
                            mainViewState.locked !==
                              MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                            mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET
                          ) {
                            removePinnedUserForAll(participant.id);
                          } else {
                            removePinnedUser(participant.id);
                          }
                        }
                        const hasHandUp =
                          functionsOnMenuBar.handNotificationInfo.find(
                            (notific) => notific.from == participant.id
                          );
                        if (hasHandUp) {
                          removeHandNotification(participant.id);
                        }
                        sendData(roomState.hostId, {
                          eventType: 'USER_LEAVING',
                          id: participant.id,
                          fractalUserId: participant.fractalUserId,
                        });
                        removeRemoteVideo(participant.id);
                      }
                    }
                    /* Hace el log de usuarios que se han ido */
                    if (offlineParticipants.length > 0) {
                      window.xprops?.logUserExits?.(offlineParticipants);
                      console.debug(
                        '🏃‍♂️ Registrando salida de los siguientes usuarios: ',
                        offlineParticipants
                      );
                    }
                  })
                  .catch((e) => console.log(e));
              }, 3500);
            }
          }

          /* Cuando termine la conexión debe colocar el isBeingPlayed */
          const streamFound = findStreamById(user);
          if (streamFound) {
            updateStreamById(user, { isBeingPlayed: true });
          } else {
            addStream({ id: user, isBeingPlayed: true });
          }

          if (
            user !== userMe.id &&
            !userMe.isHost &&
            user === roomState.hostId
          ) {
            console.debug(
              `🙍 NEW_USER ${userMe.id}: SENDS A REQUEST FOR PARTICIPANTS IN ROOM TO HOST AND ALSO SENDS HIS OWN USER INFO TO ALL`
            );
            webRTCInstance.value.sendData?.(
              roomState.hostId,
              JSON.stringify({
                eventType:
                  'NEW_USER:PARTICIPANTS_IN_ROOM_INFO_REQUEST_AND_SEND_OWN_INFO',
                from: userMe.id,
                to: roomState.hostId,
                userInfo: userMe,
              })
            );
          }

          //Si no es el host y el canal que se ha abierto es el del mismo usuario cuando empiece a hacer el publish de su stream se actualizará su campo de isPublishing
          if (user === userMe.id && !userMe.isHost) {
            webRTCInstance.value.turnOffLocalCamera?.(userMe.id);
            updateUserMe({ isPublishing: 1 });
          }

          setIsLoadingOrError(false);
        } else if (info == 'data_channel_closed') {
          console.log('Data Channel closed for stream id', obj);
          // el primer usuario que aparezca en la devolución del api ejecutará el registro de salida para los usuarios si no está el id del host en la lista de miembros:
          const channelStreamId = obj as unknown as string;
          if (roomState.hostId == channelStreamId) {
            fetch(
              `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/conference-rooms/${roomState.id}`
            )
              .then(async (res) => {
                const body = (await res.json()) as unknown as Record<
                  string,
                  string[]
                >;

                const currentParticipants: string[] = body.roomStreamList;
                const isHostInRoom = currentParticipants.includes(
                  roomState.hostId
                );
                if (!isHostInRoom) {
                  if (currentParticipants[0] == userMe.id) {
                    currentParticipants.push(roomState.hostId);
                    const leftParticipantsFractalUserId: string[] = [];
                    const allParticipants = [...participants.value, userMe];
                    for (const currentParticipant of currentParticipants) {
                      const participantInRoom = allParticipants.find(
                        (participant) => participant.id === currentParticipant
                      );
                      leftParticipantsFractalUserId.push(
                        participantInRoom?.fractalUserId as string
                      );
                    }
                    window.xprops?.logUserExits?.(
                      leftParticipantsFractalUserId
                    );
                  }
                  window.xprops?.handleLeaveCall?.(
                    REASON_TO_LEAVE_ROOM.BY_HOST_LEFT
                  );
                }
              })
              .catch((e) => console.log(e));
          }
        } else if (info == 'data_received') {
          //console.log(obj);
          const baseMessage = obj as BaseMessage;
          const baseData = baseMessage.data;
          const baseDataParsed = JSON.parse(baseData) as BaseData;

          const { eventType } = baseDataParsed;

          if (eventType === 'CHAT_MESSAGE') {
            const chatMessageParsed = JSON.parse(baseData) as Message;
            const { typeMessage } = chatMessageParsed;

            if (typeMessage == 'image' || typeMessage == 'file') {
              setUserMessage(chatMessageParsed);
              amountOfNewMessages.value++;
              acumulateMessages(amountOfNewMessages.value);
            } else {
              amountOfNewMessages.value++;
              acumulateMessages(amountOfNewMessages.value);
              setUserMessage(chatMessageParsed);
            }
          } else if (eventType === 'NOTIFICATION') {
            const baseDataNotification = JSON.parse(baseData) as Notification;

            const { notificationType } = baseDataNotification;

            handleNotificationMessage(notificationType, baseDataNotification);
          } else if (eventType === 'HAND') {
            const handNotificationParsed = JSON.parse(
              baseData
            ) as HandNotification;
            addHandNotificationInfo(handNotificationParsed);
          } else if (eventType === 'NOHAND') {
            if (userMe.id == baseDataParsed.from) {
              updateHandNotification(false);
            }
            removeHandNotification(baseDataParsed.from);
          } else if (
            eventType ===
            'NEW_USER:PARTICIPANTS_IN_ROOM_INFO_REQUEST_AND_SEND_OWN_INFO'
          ) {
            /* TODOS RECIBEN LA DATA DEL USUARIO ENTRANTE PERO SOLO EL HOST ENVÍA UN MENSAJE CON LA DATA DE LOS PARTICIPANTES EN LA SALA */

            const infoRequestParsed = JSON.parse(obj.data) as ObjRemoteUserInfo;

            if (infoRequestParsed.to === userMe.id) {
              try {
                //PONE EL OBJETO DE STREAM COMO NULO PARA QUE NO GASTE ESPACIO EN EL MENSAJE QUE IRÁ POR EL DATA CHANNEL YA QUE NO SE NECESITA ENVIAR POR AQUṔI
                const modifiedUserMe = _.cloneDeep(userMe);
                const modifiedParticipants = _.cloneDeep(participants.value);
                modifiedUserMe.stream = {} as MediaStream;
                modifiedParticipants.forEach(
                  (participant) => (participant.stream = {} as MediaStream)
                );
                const participantsInRoom = [
                  modifiedUserMe,
                  ...modifiedParticipants,
                ];

                const message = {
                  eventType: 'HOST:PARTICIPANTS_IN_ROOM_INFO',
                  from: infoRequestParsed.to,
                  to: infoRequestParsed.from,
                  participantsInRoom,
                  externalVideoInfo: { ...externalVideo },
                  roomInfo: { ...roomState },
                  mainViewState,
                };

                console.debug(
                  `🙍 HOST: RECEIVING A REQUEST FOR THE ACTUAL INFO OF THE ROOM SO I AM GOING TO SEND THAT INFO TO THE NEW USER: ${infoRequestParsed.from} / INFO:`,
                  message
                );

                try {
                  webRTCInstance.value.sendData?.(
                    roomState.hostId,
                    JSON.stringify(message)
                  );
                } catch (e) {
                  console.error(
                    'DATA_CHANNEL_ERROR: IN SEND MESSAGE TO NEW PARTICIPANT'
                  );
                }
              } catch {
                console.info(
                  'The connection is not established yet for sending a petition for INFO_REQUEST'
                );
              }
            }

            /* Todos lo añaden al participante */

            const remoteUserInfoParsed = JSON.parse(
              obj.data
            ) as ObjRemoteUserInfo;
            console.debug(
              '🙍 ALL USERS: ADDING THE NEW PARTICIPANT TO THE STATE / INFO:',
              remoteUserInfoParsed.userInfo
            );

            if (
              userMe.roleId === 0 &&
              remoteUserInfoParsed.userInfo.denied === 0 &&
              !roomState.roomRestriction
            ) {
              notifyWithAction(
                remoteUserInfoParsed.userInfo.name,
                remoteUserInfoParsed.userInfo.id
              );
            }

            const newUser = {
              id: remoteUserInfoParsed.userInfo.id,
              name: remoteUserInfoParsed.userInfo.name,
              avatar: remoteUserInfoParsed.userInfo.avatar,
              isCameraOn: remoteUserInfoParsed.userInfo.isCameraOn,
              isMicOn: remoteUserInfoParsed.userInfo.isMicOn,
              isScreenSharing: remoteUserInfoParsed.userInfo.isScreenSharing,
              isVideoActivated: remoteUserInfoParsed.userInfo.isVideoActivated,
              isMicBlocked: remoteUserInfoParsed.userInfo.isMicBlocked,
              isCameraBlocked: remoteUserInfoParsed.userInfo.isCameraBlocked,
              isScreenShareBlocked:
                remoteUserInfoParsed.userInfo.isScreenShareBlocked,
              fractalUserId: remoteUserInfoParsed.userInfo.fractalUserId,
              denied: remoteUserInfoParsed.userInfo.denied,
              isRecording: remoteUserInfoParsed.userInfo.isRecording,
              roleId: remoteUserInfoParsed.userInfo.roleId,
              isHost: remoteUserInfoParsed.userInfo.isHost,
              canDraw: remoteUserInfoParsed.userInfo.canDraw,
              isPublishing: 0,
              hasLogJoin: false,
            };

            participants.value.push(newUser);
          } else if (eventType === 'HOST:PARTICIPANTS_IN_ROOM_INFO') {
            // MENSAJE QUE RECIBE EL HOST PARA ENVIAR LA DATA DE LOS PARTICIPANTES

            const remoteUserInfoParsed = JSON.parse(
              obj.data
            ) as ObjRemoteUserInfo;
            //Recieving info from another user if is for me

            if (remoteUserInfoParsed.to === userMe.id) {
              console.debug(
                '🙍NEW USER: I AM RECEIVING INFO OF CURRENT PARTICIPANTS IN ROOM SO I AM INITIALIZING MY STATE OF PARTICIPANTS / INFO:',
                remoteUserInfoParsed.participantsInRoom
              );

              remoteUserInfoParsed.participantsInRoom.forEach(
                (participantInRoom) => {
                  const findVal = participants.value.find(
                    (participant) => participant.id === participantInRoom.id
                  );
                  const exist = !!findVal;
                  if (exist) {
                    updateParticipantById(
                      findVal?.id as string,
                      participantInRoom
                    );
                  } else {
                    // Si el participante es nuevo.
                    participants.value.push(participantInRoom);
                  }
                }
              );

              if (
                remoteUserInfoParsed.mainViewState &&
                remoteUserInfoParsed.mainViewState.locked !==
                  MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                remoteUserInfoParsed.mainViewState.locked !==
                  MAIN_VIEW_LOCKED_TYPE.UNSET
              ) {
                updateMainViewState(remoteUserInfoParsed.mainViewState);
              }

              if (remoteUserInfoParsed.roomInfo.isBeingRecorded as boolean) {
                updateRoom({ isBeingRecorded: true });
                warningMessage('Se está grabando la sesión');
              }
              if (remoteUserInfoParsed.externalVideoInfo?.videoOnRoom) {
                initRemotePlayerInstance(
                  remoteUserInfoParsed.externalVideoInfo
                );
              }

              /* } */
            }
            /* if (!userMe.isHost) {
              setIsLoadingOrError(false);
              setExistRoom(true);
            } */
          } else if (eventType === 'KICK') {
            const kickedEvent = JSON.parse(obj.data) as ObjKickedEvent;
            if (kickedEvent.to === 'all') {
              window.xprops?.handleLeaveCall?.(
                REASON_TO_LEAVE_ROOM.KICKED_BY_MODERATOR_CLOSE_ROOM
              );
            }

            if (kickedEvent.to === userMe.id) {
              window.xprops?.handleLeaveCall?.(
                REASON_TO_LEAVE_ROOM.KICKED_BY_MODERATOR
              );
            }
          } else if (eventType === 'SET_PARTICIPANT_ACTION') {
            const { action, value, participantId } = JSON.parse(
              obj.data
            ) as ObjBlockParticipantAction;

            if (participantId !== userMe.id) {
              setParticipantActions(participantId, action, value);
              return;
            }

            if (action === LOCK_ACTION_TYPE.All) {
              setRoomMicState(value);
              setLocalMicBlock(value);
              setRoomCameraState(value);
              setLocalVideoBlock(value);
              setRoomScreenShareState(value);
              setLocalScreenShareBlock(value);

              if (value) {
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);
                /* setMicIconState(!value); */
                setCameraState(!value);
                turnOffLocalCamera(userMe.id);
                sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
                /* setCameraIconState(!value); */
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
                /* setScreenShareIconState(!value); */

                updateUserMe({ isPublishing: 0 });
                stopPublishing(userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Mic) {
              // setMicBlock(value);
              setRoomMicState(value);
              setLocalMicBlock(value);

              if (value) {
                /* setMicIconState(!value); */
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);

                if (
                  userMe.isCameraOn === false &&
                  userMe.isScreenSharing === false
                ) {
                  updateUserMe({ isPublishing: 0 });
                  stopPublishing(userMe.id);
                }
              }
            } else if (action === LOCK_ACTION_TYPE.Camera) {
              // setVideoBlock(value);
              setRoomCameraState(value);
              setLocalVideoBlock(value);

              if (value) {
                /* setCameraIconState(!value); */
                setCameraState(!value);
                setVideoActivatedState(!value);
                turnOffLocalCamera(userMe.id);
                sendNotificationEvent('CAM_TURNED_OFF', userMe.id);

                if (
                  userMe.isMicOn === false &&
                  userMe.isScreenSharing === false
                ) {
                  updateUserMe({ isPublishing: 0 });
                  stopPublishing(userMe.id);
                }
              }
            } else if (action === LOCK_ACTION_TYPE.Screen) {
              // setScreenShareBlock(value);
              setRoomScreenShareState(value);
              setLocalScreenShareBlock(value);

              if (value) {
                /* setScreenShareIconState(!value); */
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);

                if (userMe.isMicOn === false && userMe.isCameraOn === false) {
                  updateUserMe({ isPublishing: 0 });
                  stopPublishing(userMe.id);
                }
              }
            }
          } else if (eventType === 'SET_EVERYONE_ACTION') {
            const { action, value } = JSON.parse(
              obj.data
            ) as ObjBlockEveryoneAction;

            if (action === LOCK_ACTION_TYPE.All) {
              setRoomMicState(value);
              setRoomCameraState(value);
              setRoomScreenShareState(value);

              if (userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setLocalMicBlock(value);
                setLocalVideoBlock(value);
                setLocalScreenShareBlock(value);
              }

              setEveryParticipantActions(LOCK_ACTION_TYPE.All, value);

              if (value && userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);
                /* setMicIconState(!value); */
                setCameraState(!value);
                turnOffLocalCamera(userMe.id);
                sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
                /* setCameraIconState(!value); */
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
                /* setScreenShareIconState(!value); */

                updateUserMe({ isPublishing: 0 });
                stopPublishing(userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Mic) {
              setRoomMicState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Mic, value);

              if (userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setLocalMicBlock(value);

                if (value) {
                  /* setMicIconState(!value); */
                  setMicState(!value);
                  muteLocalMic();
                  sendNotificationEvent('MIC_MUTED', userMe.id);

                  if (
                    userMe.isCameraOn === false &&
                    userMe.isScreenSharing === false
                  ) {
                    updateUserMe({ isPublishing: 0 });
                    stopPublishing(userMe.id);
                  }
                }
              }
            } else if (action === LOCK_ACTION_TYPE.Camera) {
              setRoomCameraState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Camera, value);

              if (userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setLocalVideoBlock(value);

                if (value) {
                  /* setCameraIconState(!value); */
                  setCameraState(!value);
                  setVideoActivatedState(!value);
                  turnOffLocalCamera(userMe.id);
                  sendNotificationEvent('CAM_TURNED_OFF', userMe.id);

                  if (
                    userMe.isMicOn === false &&
                    userMe.isScreenSharing === false
                  ) {
                    updateUserMe({ isPublishing: 0 });
                    stopPublishing(userMe.id);
                  }
                }
              }
            } else if (action === LOCK_ACTION_TYPE.Screen) {
              setRoomScreenShareState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Screen, value);

              if (userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setLocalScreenShareBlock(value);

                if (value) {
                  /* setScreenShareIconState(!value); */
                  setScreenState(!value);
                  setVideoActivatedState(!value);
                  resetDesktop();
                  sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);

                  if (userMe.isMicOn === false && userMe.isCameraOn === false) {
                    updateUserMe({ isPublishing: 0 });
                    stopPublishing(userMe.id);
                  }
                }
              }
            }
          } else if (eventType === 'ANSWER_PERMISSION') {
            const { participantId, value } = JSON.parse(
              obj.data
            ) as ObjAnswerPermission;

            if (userMe.id === participantId) {
              if (value) {
                // setRoomRestriction(0);
                setDenied(PERMISSION_STATUS.admitted);
              } else {
                setDenied(PERMISSION_STATUS.denied);
              }
            } else {
              updateParticipantDenied(
                participantId,
                value ? PERMISSION_STATUS.admitted : PERMISSION_STATUS.denied
              );
            }
          } else if (eventType === 'SHARE_EXTERNAL_VIDEO') {
            const externalVideoObject = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            /* setFullScreen('video', true); */
            /* updateMainViewState({
              mode: MAIN_VIEW_MODE.VIDEO,
            }); */
            updateExternalVideoState({
              urlVideo: externalVideoObject.urlVideo,
            });
            setTimeout(() => {
              console.log(
                'ID DEL REMOTO 🚀',
                (externalVideo.remoteInstance as VideoID).playerId
              );
              remotePlayer.value = videojs(
                (externalVideo.remoteInstance as VideoID).playerId
              );
            }, 2000);
          } else if (eventType == 'PLAYING_VIDEO') {
            const externalVideoInfo = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            playExternalVideo(externalVideoInfo);
          } else if (eventType == 'PAUSE_VIDEO') {
            const externalVideoInfo = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            pauseExternalVideo(externalVideoInfo);
          } else if (eventType === 'UPDATE_VIDEOTIME') {
            const externalVideoInfo = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            updateVideoTime(externalVideoInfo);
          } else if (eventType === 'SET_FULL_SCREEN') {
            const { mainViewState } = JSON.parse(obj.data) as Record<
              string,
              MainViewState
            >;
            updateMainViewState(mainViewState);
          } else if (eventType == 'REMOVE_EXTERNAL_VIDEO') {
            const externalVideoInfo = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            removeVideoShared(externalVideoInfo);
          } else if (eventType === 'UPDATE_ROOM_BG') {
            const bgData = JSON.parse(obj.data) as backgroundInfo;
            updateBgUrl(bgData.url);
          } else if (eventType === 'UPDATE_ROOM_SIZE') {
            const bgData = JSON.parse(obj.data) as backgroundSize;
            updateBgSize(bgData.maximized);
          } else if (eventType === 'USER_LEAVING') {
            console.log('user_leaving message received');
            const userLeavingMsgParsed = JSON.parse(
              obj.data
            ) as ObjUserLeavingMessageParsed;

            const hasHandUp = functionsOnMenuBar.handNotificationInfo.find(
              (notific) => notific.from == userLeavingMsgParsed.id
            );

            if (hasHandUp) {
              removeHandNotification(userLeavingMsgParsed.id);
            }

            /* if (roomState.pinnedUser?.id === userLeavingMsgParsed.id) {
              setFullScreen('none', false);
              clearFullScreenObject();
              updateRoom({ pinnedUser: null });
            } */

            window.xprops?.addUserLogToState?.(
              userLeavingMsgParsed.fractalUserId,
              LOG_TYPE.OUT
            );

            removeRemoteVideo(userLeavingMsgParsed.id);
          } else if (eventType === 'STOP_PLAYING_STREAM') {
            const { streamToPause } = JSON.parse(baseData) as stopPlayingStream;
            const stream = findStreamById(streamToPause);
            if (!stream?.isBeingPlayed) {
              webRTCInstance.value.stop(streamToPause);
              updateStreamById(streamToPause, { isBeingPlayed: false });
            }
          } else if (eventType === 'BOARD_EVENT') {
            const { event, objects, color } = JSON.parse(
              obj.data
            ) as ObjBoardEvent;            

            if (!objects) {
              if (event === BOARD_EVENTS.TURN_ON) {
                updateBoardState(true);
              } else if (event === BOARD_EVENTS.TURN_OFF) {
                updateBoardState(false);
              } else if (event === BOARD_EVENTS.CLEAR) {
                clearBoard();
              } else if (event === BOARD_EVENTS.TOGGLE_DRAW_MODE) {
                if (baseDataParsed.to === userMe.id) {
                  if (userMe.canDraw) {
                    discardSelection();
                  }

                  toggleDrawState();
                } else {
                  const participantToUpdate = participants.value.find(
                    (p) => p.id === baseDataParsed.to
                  );

                  if (participantToUpdate) {
                    updateParticipantById(baseDataParsed.to, {
                      canDraw: !participantToUpdate.canDraw,
                    });
                  }
                }
              } else if (event === BOARD_EVENTS.CHANGE_BG_COLOR) {
                changeBgColor(color);
              }
            } else {
              if (event === BOARD_EVENTS.OBJECT_ADD) {
                handleMultipleObjects({objects});
              } else if (event === BOARD_EVENTS.OBJECT_UPDATE) {
                handleMultipleObjects({objects});
              }else if (event === BOARD_EVENTS.OBJECT_REMOVE) {
                handleMultipleObjects({objects});
              }
            }
          }
        }
      },
      callbackError: function (
        error: string,
        message: string /* error: string, message: string */
      ) {
        console.error(error, message);
        //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
        if (
          error.indexOf('publishTimeoutError') != -1 &&
          roomTimerId.value != null
        ) {
          if (participants.value.length <= 0) {
            clearInterval(roomTimerId.value as NodeJS.Timeout);
            const errorMessage =
              'Error al publicar stream: Parece que su conexión es lenta, Por favor, recargue la página';
            setLoadingOrErrorMessage(errorMessage);
            setExistRoom(false);
          } else {
            //Si hubo un error al publicar vuelve a intentarlo
            console.debug(
              'There was an error publishing the stream. Trying again...'
            );
            publish(userMe.id, undefined, undefined, undefined, userMe.name);
          }
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
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
        } else if (
          error.indexOf('OverconstrainedError') != -1 ||
          error.indexOf('ConstraintNotSatisfiedError') != -1
        ) {
          errorMessage =
            'There is no device found that fits your video and audio constraints. You may change video and audio constraints.';
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
        } else if (
          error.indexOf('NotAllowedError') != -1 ||
          error.indexOf('PermissionDeniedError') != -1
        ) {
          errorMessage = 'You are not allowed to access camera and mic.';
          setExistRoom(false);
          setLoadingOrErrorMessage(errorMessage);
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
          /* setExistRoom(false); */
          setLoadingOrErrorMessage(errorMessage);
        } else if (error.indexOf('data_channel_error') != -1) {
          errorMessage = 'There was a error during data channel communication';
        } else if (error.indexOf('ScreenSharePermissionDenied') != -1) {
          updateUserMe({
            isScreenSharing: false,
          });
          webRTCInstance.value.resetDesktop?.();
          sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);

          if (
            !userMe.isCameraOn &&
            !userMe.isMicOn &&
            !userMe.isHost &&
            !userMe.isRecording
          ) {
            stopPublishing(streamId);
            updateUserMe({ isPublishing: 0 });
          }

          if (!userMe.isCameraOn) {
            setTimeout(() => {
              webRTCInstance.value.turnOffLocalCamera?.(userMe.id);
            }, 1000);
          }

          errorMessage = 'No has dado permisos para compartir tus dispositivos';
          //screen_share_checkbox.checked = false;
        } else if (error.indexOf('AbortError') !== -1) {
          setExistRoom(false);
          setLoadingOrErrorMessage(
            'Error desconocido. Por favor, verifique que sus dispositivos no estén siendo usados por otra aplicación'
          );
        } else if (error.indexOf('notSetRemoteDescription') !== -1) {
          setExistRoom(false);
          setLoadingOrErrorMessage('Error: Su dispositivo no es compatible');
        }

        console.error(errorMessage, error, message, '#️⃣');
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

  //TODO: Get the device id in the websocket as it works in remotePlayer.html
  const switchVideoCameraCapture = (streamId: string, cameraId: string) => {
    console.log('FUENTE DE CAMARA', cameraId);
    webRTCInstance.value.switchVideoCameraCapture?.(streamId, cameraId);
    // let cameraId: string;
    // navigator.mediaDevices
    //   .enumerateDevices()
    //   .then((devices) => {
    //     const filtrado = devices.filter((x) => x.kind === 'videoinput')[0];
    //     cameraId = filtrado.deviceId;
    //   })
    //   .catch((err) => console.log(err));
  };
  const switchAudioInputSource = (streamId: string, microId: string) => {
    console.log('fuente de audio', microId);
    webRTCInstance.value.switchAudioInputSource?.(streamId, microId);
    // let microId: string;
    // navigator.mediaDevices
    //   .enumerateDevices()
    //   .then((devices) => {
    //     const filtrado = devices.filter((x) => x.kind === 'audioinput')[0];
    //     microId = filtrado.deviceId;
    //   })
    //   .catch((err) => console.log(err));
  };

  const resetDesktop = () => {
    webRTCInstance.value.resetDesktop?.();
  };

  const turnOnLocalCamera = (streamId: string) => {
    /* navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        console.log(devices);
        const filtrado = devices.filter((x) => x.kind === 'videoinput')[0];
        cameraId = filtrado.deviceId;
        webRTCInstance.value.switchVideoCameraCapture?.(streamId, cameraId);
      })
      .catch((err) => console.log(err)); */
    // webRTCInstance.value.switchVideoCameraCapture?.(streamId, userMe.cameraId);
    webRTCInstance.value.turnOnLocalCamera?.(streamId);
  };

  const unmuteLocalMic = () => {
    //webRTCInstance.value.switchAudioInputSource(userMe.id, userMe.micId);
    webRTCInstance.value.unmuteLocalMic?.();
  };

  const muteLocalMic = () => {
    webRTCInstance.value.muteLocalMic?.();
  };

  const sendNotificationEvent = (
    notificationType: string,
    streamId: string,
    state?: boolean | Record<string, string>
  ) => {
    const notEvent = {
      streamId: userMe.id,
      notificationType,
      eventType: 'NOTIFICATION',
      state,
    };

    webRTCInstance.value.sendData?.(roomState.hostId, JSON.stringify(notEvent));
  };

  const justTurnOnLocalCamera = (streamId: string) => {
    webRTCInstance.value.justTurnOnLocalCamera?.(streamId);
  };

  const stopPublishing = (streamId: string) => {
    webRTCInstance.value.stop(streamId);
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
    switchAudioInputSource,
    publish,
    stopPublishing,
  };
}
