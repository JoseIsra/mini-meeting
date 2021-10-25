import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { useUserMe } from '@/composables/userMe';
import { User } from '@/types/user';
import { useAuthState } from '@/composables/auth';
import { objWebRTC } from '@/types/index';

import {
  REASON_TO_LEAVE_ROOM,
  LOCK_ACTION_TYPE,
  USER_ROLE,
} from '@/utils/enums';
import { useHandleParticipants } from '@/composables/participants';
import { useHandleMessage } from '@/composables/chat';
import { useToogleFunctions } from '@/composables';
import {
  HandNotification,
  stopPlayingStream,
} from '@/types/datachannelMessages';
import { useRoom } from '@/composables/room';
import { PERMISSION_STATUS } from '@/utils/enums';
import { notifyWithAction } from '@/utils/notify';
import { useExternalVideo } from './external-video';
import videojs from 'video.js';
import { useActions } from '@/composables/actions';
import { LOG_TYPE } from '@/utils/enums/zoid';
import _ from 'lodash';
/*  */
import {
  ExternalVideoObject,
  ObjAnswerPermission,
  ObjBlockEveryoneAction,
  ObjBlockParticipantAction,
  ObjKickedEvent,
  ObjRecordingStopParsed,
  ObjRemoteUserInfo,
  ObjSetFullScreen,
  ObjUserLeavingMessageParsed,
  VideoID,
  backgroundInfo,
  backgroundSize,
  BaseMessage,
  BaseData,
  Message,
  Notification,
} from '@/types/datachannelMessages';

import { useStreams } from '@/composables/streams';

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
  setroomRestriction,
  updateFocus,
  updateBgUrl,
  updateBgSize,
  roomState,
} = useRoom();

const {
  deleteParticipantById,
  participants,
  addParticipant,
  updateParticipantDenied,
  admittedParticipants,
  updateParticipantById,
  setEveryParticipantActions,
  setParticipantActions,
  findParticipantById,
} = useHandleParticipants();

const { setUserMessage, deleteLoadingMessage } = useHandleMessage();

const {
  addHandNotificationInfo,
  removeHandNotification,
  setFullScreen,
  setFullScreenObject,
  isFullScreen,
  setIDButtonSelected,
  clearFullScreenObject,
} = useToogleFunctions();

const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);

const isDataChannelOpen = ref(false);

const {
  updateExternalVideoState,
  videoPlayerTest,
  externalVideo,
  setVideoInstance,
} = useExternalVideo();

const { setScreenShareIconState } = useActions();

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
            updateStreamById(user?.id as string, { isBeingPlayed: false });
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
            updateStreamById(user?.id as string, { isBeingPlayed: false });
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
            updateStreamById(user?.id as string, { isBeingPlayed: false });
        }
      },
      RECORDING_STARTED: function () {
        updateRoom({ isBeingRecorded: true });
      },
      RECORDING_STOPPED: function () {
        updateRoom({ isBeingRecorded: false });
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
          urls: 'stun:stun1.l.google.com:19302',
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
      void remotePlayer.value.currentTime(arg.currentTime as number);
    };

    const initRemotePlayerInstance = (arg: User) => {
      setFullScreen('video', true);
      updateExternalVideoState({
        ...externalVideo,
        urlVideo: arg.urlOfVideo,
      });
      setTimeout(() => {
        remotePlayer.value = videojs(arg.videoInstance?.playerId);

        setTimeout(() => {
          remotePlayer.value.currentTime(arg.currentTime);
          if (!arg.isPlayingVideo) {
            remotePlayer.value.pause();
          }
        }, 500);
      }, 1000);
    };

    const removeVideoShared = (arg: ExternalVideoObject) => {
      remotePlayer.value = videojs((arg.remoteInstance as VideoID).playerId);
      setVideoInstance({} as HTMLMediaElement & { playerId: string });
      videojs((arg.remoteInstance as VideoID).playerId).dispose();
      setFullScreen('none', false);
      updateUserMe({
        ...userMe,
        existVideo: false,
        urlOfVideo: '',
        videoInstance: {} as HTMLMediaElement & { playerId: string },
        currentTime: 0,
        isPlayingVideo: false,
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
                addParticipant({ id: obj.streamId, stream: obj.stream });
            }
            console.log(participants.value, '🅿️🅿️');
          }
        } else if (info == 'publish_started') {
          console.debug('publish started');
          if (userMe.isHost) {
            updateUserMe({ isPublishing: 1 });
          }
        } else if (info == 'publish_finished') {
          console.debug('publish finished');
        } else if (info == 'screen_share_stopped') {
          console.log('screen share stopped');
          setScreenState(false);
          setVideoActivatedState(false);
          setIDButtonSelected('');
          webRTCInstance.value.turnOffLocalCamera?.(streamId);
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
                    for (const participant of participants.value) {
                      for (const participant of admittedParticipants.value) {
                        if (
                          currentParticipants.includes(
                            participant.id as string
                          ) &&
                          !participant.hasLogJoin
                        ) {
                          console.log(
                            'asistencia registrada (login) con el siguiente id: ',
                            participant?.fractalUserId
                          );
                          window.xprops?.logJoined?.(
                            participant?.fractalUserId as string
                          );
                          updateParticipantById(participant?.id as string, {
                            hasLogJoin: true,
                          });
                        }
                      }

                      if (offlineParticipants.length > 0)
                        window.xprops?.logUserExits?.(offlineParticipants);

                      if (
                        !currentParticipants.includes(participant.id as string)
                      ) {
                        const isAnAdmittedParticipant =
                          admittedParticipants.value.some(
                            (admittedParticipant) =>
                              admittedParticipant.id == participant.id
                          );
                        if (isAnAdmittedParticipant) {
                          offlineParticipants.push(
                            participant.fractalUserId as string
                          );
                        }
                        /*  */
                        /* Senddata debe estar antes del removeRemoteVideo para que pueda enviar la información del usuario a eliminar */
                        sendData(roomState.hostId, {
                          eventType: 'USER_LEAVING',
                          id: participant.id,
                          fractalUserId: participant.fractalUserId,
                        });

                        /* if (roomState.pinnedUser?.id === participant.id) {
                          sendData(roomState.hostId, {
                            eventType: 'SET_FULL_SCREEN',
                            mode: 'none',
                          });
                        }
                        if (participant.isRecording) {
                          updateRoom({ isBeingRecorded: false });
                          sendNotificationEvent(
                            'RECORDING_STOPPED',
                            roomState.hostId
                          );
                          window.xprops?.handleStopRecording?.(
                            roomState.recordingUrl
                          );
                        } */
                        removeRemoteVideo(participant.id as string);
                      }
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
              '⭐ SENDING REQUEST FOR INFO OF PARTICIPANTS IN ROOM',
              obj
            );

            //PIDE INFORMACIÓN DE LOS PARTICIPANTES Y LA SALA SOLO AL HOST PERO TAMBIÉN ENVIA SU PROPIA DATA
            /* setTimeout(() => { */
            webRTCInstance.value.sendData?.(
              roomState.hostId,
              JSON.stringify({
                eventType: 'NEW_USER:PARTICIPANTS_IN_ROOM_INFO_REQUEST',
                from: userMe.id,
                to: roomState.hostId,
                userInfo: userMe,
              })
            );
            /* }, 1000); */
          }

          //Si no es el host y el canal que se ha abierto es el del mismo usuario cuando empiece a hacer el publish de su stream se actualizará su campo de isPublishing
          if (user === userMe.id && !userMe.isHost) {
            updateUserMe({ isPublishing: 1 });
          }

          //isLoadingOrError.value = false;
          setIsLoadingOrError(false);
          isDataChannelOpen.value = true;
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

          // isDataChannelOpen.value = false;
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
              deleteLoadingMessage(chatMessageParsed.streamId);
              setUserMessage(chatMessageParsed);
            } else {
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
            removeHandNotification(baseDataParsed.from);
          } else if (
            eventType === 'NEW_USER:PARTICIPANTS_IN_ROOM_INFO_REQUEST'
          ) {
            /* TODOS RECIBEN LA DATA DEL USUARIO ENTRANTE PERO SOLO EL HOST ENVÍA UN MENSAJE CON LA DATA DE LOS PARTICIPANTES EN LA SALA */

            const infoRequestParsed = JSON.parse(obj.data) as ObjRemoteUserInfo;

            if (infoRequestParsed.to === userMe.id) {
              console.info(
                '⭐ RECEIVING A REQUEST OF PARTICPANTS IN THE ROOM INFO AND ADDING THE DATA OF THE PERSON WHO IS ENTERING',
                obj,
                'from:',
                userMe.id
              );
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
                console.log(participantsInRoom, 'PArticipants in room ⭐');

                try {
                  webRTCInstance.value.sendData?.(
                    roomState.hostId,
                    JSON.stringify({
                      eventType: 'HOST:PARTICIPANTS_IN_ROOM_INFO',
                      from: infoRequestParsed.to,
                      to: infoRequestParsed.from,
                      participantsInRoom,
                    })
                  );
                } catch (e) {
                  console.error(
                    'DATA_CHANNEL_ERROR: IN SEND MESSAGE TO NEW PARTICIPANT'
                  );
                }
                console.log('my info have been sent');
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

            const newUser = {
              id: remoteUserInfoParsed.userInfo.id,
              avatar: remoteUserInfoParsed.userInfo.avatar,
              name: remoteUserInfoParsed.userInfo.name,
              isCameraOn: remoteUserInfoParsed.userInfo.isCameraOn,
              isMicOn: remoteUserInfoParsed.userInfo.isMicOn,
              isScreenSharing: remoteUserInfoParsed.userInfo.isScreenSharing,
              isVideoActivated: remoteUserInfoParsed.userInfo.isVideoActivated,
              isMicBlocked: remoteUserInfoParsed.userInfo.isMicBlocked,
              isCameraBlocked: remoteUserInfoParsed.userInfo.isCameraBlocked,
              isScreenShareBlocked:
                remoteUserInfoParsed.userInfo.isScreenShareBlocked,
              denied: remoteUserInfoParsed.userInfo.denied,
              isRecording: remoteUserInfoParsed.userInfo.isRecording,
              fractalUserId: remoteUserInfoParsed.userInfo.fractalUserId,
              existVideo: remoteUserInfoParsed.userInfo.existVideo,
              hasLogJoin: false,
            };

            if (remoteUserInfoParsed.userInfo.existVideo) {
              initRemotePlayerInstance(remoteUserInfoParsed.userInfo);
            }

            participants.value.push(newUser);
          } else if (eventType === 'HOST:PARTICIPANTS_IN_ROOM_INFO') {
            // MENSAJE QUE RECIBE EL HOST PARA ENVIAR LA DATA DE LOS PARTICIPANTES
            console.info(
              '⭐ I am recieving info of user in room and i am setting it in my local state',
              obj,
              'from:',
              userMe.id
            );

            const remoteUserInfoParsed = JSON.parse(
              obj.data
            ) as ObjRemoteUserInfo;
            //Recieving info from another user if is for me

            if (remoteUserInfoParsed.to === userMe.id) {
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

              /* if (
                userMe.roleId === 0 &&
                remoteUserInfoParsed.userInfo.denied === 0 &&
                !roomState.roomRestriction
              ) {
                notifyWithAction(
                  remoteUserInfoParsed.userInfo.name,
                  remoteUserInfoParsed.userInfo.id
                );
              } */
              /* } */
            }
            /* if (!userMe.isHost) {
              setIsLoadingOrError(false);
              setExistRoom(true);
            } */
          } else if (eventType === 'USER_INFO_FINISH') {
            const remoteUserInfoParsed = JSON.parse(
              obj.data
            ) as ObjRemoteUserInfo;

            if (remoteUserInfoParsed.to === userMe.id) {
              const user = participants.value.find(
                (participant) =>
                  participant.id === remoteUserInfoParsed.userInfo.id
              );
              if (user) {
                console.log('Usuario encontrado: ', user);

                user.avatar = remoteUserInfoParsed.userInfo.avatar;
                user.name = remoteUserInfoParsed.userInfo.name;
                user.isCameraOn = remoteUserInfoParsed.userInfo.isCameraOn;
                user.isMicOn = remoteUserInfoParsed.userInfo.isMicOn;
                user.isScreenSharing =
                  remoteUserInfoParsed.userInfo.isScreenSharing;
                user.isVideoActivated =
                  remoteUserInfoParsed.userInfo.isVideoActivated;
                user.isMicBlocked = remoteUserInfoParsed.userInfo.isMicBlocked;
                user.isCameraBlocked =
                  remoteUserInfoParsed.userInfo.isCameraBlocked;
                user.isScreenShareBlocked =
                  remoteUserInfoParsed.userInfo.isScreenShareBlocked;
                user.fractalUserId =
                  remoteUserInfoParsed.userInfo.fractalUserId;
                user.denied = remoteUserInfoParsed.userInfo.denied;
                user.isRecording = remoteUserInfoParsed.userInfo.isRecording;
                user.roleId = remoteUserInfoParsed.userInfo.roleId;

                if (remoteUserInfoParsed.userInfo.existVideo) {
                  console.log(
                    'HAY VIDEO EN LA SALA',
                    remoteUserInfoParsed.userInfo
                  );
                  user.existVideo = true;
                  user.urlOfVideo = remoteUserInfoParsed.userInfo.urlOfVideo;
                  initRemotePlayerInstance(remoteUserInfoParsed.userInfo);
                }

                /*  window.xprops?.addUserLogToState?.(
                  user.fractalUserId,
                  LOG_TYPE.IN
                ); */
              }
            }
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
                setScreenShareIconState(!value);
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
              }
            } else if (action === LOCK_ACTION_TYPE.Screen) {
              // setScreenShareBlock(value);
              setRoomScreenShareState(value);
              setLocalScreenShareBlock(value);

              if (value) {
                setScreenShareIconState(!value);
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
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
                setScreenShareIconState(!value);
              }
            } else if (action === LOCK_ACTION_TYPE.Mic) {
              setRoomMicState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Mic, value);

              if (value) {
                /* setMicIconState(!value); */
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Camera) {
              setRoomCameraState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Camera, value);

              if (value) {
                /* setCameraIconState(!value); */
                setCameraState(!value);
                setVideoActivatedState(!value);
                turnOffLocalCamera(userMe.id);
                sendNotificationEvent('CAM_TURNED_OFF', userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Screen) {
              setRoomScreenShareState(value);
              setEveryParticipantActions(LOCK_ACTION_TYPE.Screen, value);

              if (userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setLocalScreenShareBlock(value);
              }

              if (value && userMe.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
                setScreenShareIconState(!value);
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
              }
            }
          } else if (eventType === 'ANSWER_PERMISSION') {
            const { participantId, value } = JSON.parse(
              obj.data
            ) as ObjAnswerPermission;

            if (userMe.id === participantId) {
              console.log('Respuesta para mi');

              if (value) {
                setroomRestriction(0);
                setDenied(PERMISSION_STATUS.admitted);
              } else {
                setDenied(PERMISSION_STATUS.denied);
              }
            } else {
              console.log('Respuesta para un participante: ', participantId);

              updateParticipantDenied(
                participantId,
                value ? PERMISSION_STATUS.admitted : PERMISSION_STATUS.denied
              );
            }
          } else if (eventType === 'SHARE_EXTERNAL_VIDEO') {
            const externalVideoObject = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            setFullScreen('video', true);
            updateExternalVideoState({
              urlVideo: externalVideoObject.urlContent,
            });
            setTimeout(() => {
              console.log('ID DEL REMOTO 🚀', videoPlayerTest.playerId);
              // setVideoInstance(videoPlayerTest);
              remotePlayer.value = videojs(videoPlayerTest.playerId);
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
            console.log('hi there');
            const { participant, mode } = JSON.parse(
              obj.data
            ) as ObjSetFullScreen;

            if (participant && mode === 'user') {
              console.log('Activar fijar usuario');
              if (isFullScreen.value) {
                setFullScreenObject(participant);
                updateFocus(participant);
                return;
              }
              console.log('here', participant);
              setFullScreen(mode, true);
              setFullScreenObject(participant);
              updateFocus(participant);
            } else {
              console.log('Quitar fijar usuario');
              setFullScreen(mode, false);
              clearFullScreenObject();
              updateFocus(null);
            }
          } else if (eventType == 'REMOVE_EXTERNAL_VIDEO') {
            const externalVideoInfo = JSON.parse(
              obj.data
            ) as ExternalVideoObject;
            updateExternalVideoState({
              ...externalVideo,
              videoOnRoom: false,
              urlVideo: '',
              isVideoPlaying: false,
              videoCurrentTime: 0,
            });
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

            console.log('USER LEAVING', '🚀🚀🚀');

            if (
              roomState.pinnedUser?.fractalUserId ===
              userLeavingMsgParsed.fractalUserId
            ) {
              window.xprops?.setPinnedUser?.('');
            }

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
          setIDButtonSelected('');
          if (!userMe.isCameraOn) {
            userMe.isVideoActivated = false;
            userMe.isScreenSharing = false;
            webRTCInstance.value.turnOffLocalCamera?.(userMe.id);
          }
          webRTCInstance.value.resetDesktop?.();
          sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
          errorMessage = 'No has dado permisos para compartir tus dispositivos';
          //screen_share_checkbox.checked = false;
        } else if (error.indexOf('AbortError') !== -1) {
          setExistRoom(false);
          setLoadingOrErrorMessage(
            'Error desconocido. Por favor, verifique que sus dispositivos no estén siendo usados por otra aplicación'
          );
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
    state?: boolean | Record<string, string>
  ) => {
    /* if (isDataChannelOpen.value) { */
    const notEvent = {
      streamId: userMe.id,
      notificationType,
      eventType: 'NOTIFICATION',
      state,
    };

    webRTCInstance.value.sendData?.(roomState.hostId, JSON.stringify(notEvent));
    /* } else {
      console.log(
        'Could not send the notification because data channel is not open.'
      );
    } */
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
    publish,
    stopPublishing,
  };
}
