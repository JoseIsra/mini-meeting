import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { useUserMe, User } from '@/composables/userMe';
import { useAuthState } from '@/composables/auth';
import { objWebRTC, Participant } from '@/types/index';
import { REASON_TO_LEAVE_ROOM, LOCK_ACTION_TYPE } from '@/utils/enums';
import { useHandleParticipants } from '@/composables/participants';
import { Message, useHandleMessage } from '@/composables/chat';
import { useToogleFunctions } from '@/composables';
import { useRoom } from '@/composables/room';
import { PERMISSION_STATUS } from '@/utils/enums';
import { notifyWithAction } from '@/utils/notify';
import { useExternalVideo } from './external-video';
import videojs from 'video.js';
import { useActions } from '@/composables/actions';
import { LOG_TYPE } from '@/utils/enums/zoid';
import _ from 'lodash';

const webRTCInstance = ref<WebRTCAdaptor>({} as WebRTCAdaptor);

const {
  userMe,
  setScreenState,
  setVideoActivatedState,
  updateUserMe,
  setMicState,
  setCameraState,
  setDenied,
} = useUserMe();

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

const alreadyPublishing = ref(false);

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
  participantsInRoom: Participant[];
}

interface ObjKickedEvent {
  eventType: string;
  to: string;
}
interface VideoID {
  playerId: string;
}
interface ExternalVideoObject {
  eventType?: string;
  urlContent?: string;
  remoteInstance?: VideoID | string | HTMLVideoElement;
  currentTime?: number;
  fullScreenMode?: boolean;
}

interface ObjBlockParticipantAction {
  id: string;
  streamId: string;
  participantId: string;
  eventType: string;
  action: number;
  value: boolean;
}

interface ObjBlockEveryoneAction {
  id: string;
  streamId: string;
  eventType: string;
  action: number;
  value: boolean;
}

interface ObjAnswerPermission {
  id: string;
  participantId: string;
  eventType: string;
  value: boolean;
}

interface ObjSetFullScreen {
  id: string;
  eventType: string;
  mode: string;
  participant: User;
}

interface backgroundInfo {
  id: string;
  url: string;
}

interface backgroundSize {
  maximized: boolean;
}

interface ObjUserLeavingMessageParsed {
  id: string;
  fractalUserId: string;
}

interface ObjRecordingStopParsed {
  state: Record<string, string>;
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
    if (!userMe.isPublishing) {
      /* 
      /*  webRTCInstance.value.play?.(
        roomState.hostId,
        undefined,
        roomState.id,
        undefined,
        undefined,
        undefined
      ); */
      /* webRTCInstance.value.leaveFromRoom?.(roomState.id); */

      webRTCInstance.value.publish?.(
        streamId,
        token,
        subscriberId,
        subscriberCode,
        streamName
      );
      /* joinRoom(roomState.id, userMe.id); */
      /* webRTCInstance.value.join(streamId); */
    } else {
      webRTCInstance.value.publish?.(
        streamId,
        token,
        subscriberId,
        subscriberCode,
        streamName
      );
    }
  };

  const removeRemoteVideo = (streamId: string) => {
    deleteParticipantById(streamId);
    console.log('removing participant 🛕');
  };

  const streamInformation = (
    obj: objWebRTC,
    roomId: string,
    playToken?: string
  ) => {
    const isMerge = obj.streamId.split('-')[0] === 'm';
    console.log(obj);
    if (!isMerge)
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
        remotePlayer.value = videojs(arg.videoInstance?.playerId as string);

        setTimeout(() => {
          remotePlayer.value.currentTime(arg.currentTime as number);
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
      // setTimeout(() => {
      //   setTimeout(() => {
      //   }, 500);
      // }, 1000);
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
          console.log('initialized');

          if (!userMe.isCameraOn) {
            webRTCInstance.value.turnOffLocalCamera?.(streamId);
          }
          if (!userMe.isMicOn) {
            muteLocalMic();
          }

          const localStream = webRTCInstance.value.getLocalStream?.();

          updateUserMe({ stream: localStream });

          joinRoom(roomId, streamId);
        } else if (info == 'joinedTheRoom') {
          window.addEventListener('unload', () => {
            sendData(roomState.hostId, {
              eventType: 'USER_LEAVING',
              id: userMe.id,
              fractalUserId: userMe.fractalUserId,
            });

            if (roomState.pinnedUser?.id === userMe.id) {
              sendData(roomState.hostId, {
                eventType: 'SET_FULL_SCREEN',
                mode: 'none',
              });
            }

            if (userMe.isRecording) {
              const idUserGoingToStopRec =
                admittedParticipants.value.filter(
                  (participant) => participant.roleId === 0
                )?.[0].id || admittedParticipants.value[0].id;

              if (idUserGoingToStopRec)
                sendNotificationEvent('RECORDING_STOPPED', userMe.id, {
                  to: idUserGoingToStopRec,
                });
            }

            try {
              leaveRoom(roomId);
            } catch (e) {
              console.log(e);
            }
          });

          /* watch(
            () => userMe.isPublishing,
            (actual, prev) => {
              if (actual) {
                publish(
                  userMe.id,
                  undefined,
                  undefined,
                  undefined,
                  userMe.name
                );
                const interval = setInterval(() => {
                  if(alreadyPublishing.value) {
                    
                    clearInterval(interval)
                  }
                }, 1000);
              } else console.log('ispublishing or not', actual);
            }
          ); */
          /* watch(
            () => alreadyPublishing,
            (act, prev) => {
              if (act) {
                updateUserMe({ isPublishing: true });
                console.log(userMe.isPublishing);
              }
            }
          ); */
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
          if (userMe.isHost) {
            publish(
              streamId,
              publishToken,
              subscriberId,
              subscriberCode,
              streamName
            );
          }

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
          console.log('NEW STREAM!!!!!!!!!!!');
          console.log(obj);

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
          /* console.debug(
            `publish started to room: #️⃣ ${roomOfStream.value[obj.streamId]}`
          ); */
          console.debug('publish started');
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

          //TODO: este es el error por el que sale streamid que ya se está escuchando
          /* if (participants.value.length !== 0) {
            deleteAllParticipants();
          } */
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
          //removeRemoteVideo(obj.streamId);
        } else if (info == 'streamInformation') {
          streamInformation(obj, roomId, playToken);
        } else if (info == 'roomInformation') {
          /* console.log(obj.streams); */
          /* participants.value.forEach((previousParticip
            ant) => {
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
            const isMerge = str.split('-')[0] === 'm';

            if (!participant?.isBeingPlayed) {
              webRTCInstance.value.play?.(
                str,
                playToken,
                roomId,
                undefined,
                undefined,
                undefined
              );
              updateParticipantById(participant.id as string, {
                isBeingPlayed: true,
              });
            }
            //Si el participante es nuevo - play
            /* if (participant) {
              if (!participant.isBeingPlayed && !isMerge) {
                webRTCInstance.value.play?.(
                  str,
                  playToken,
                  roomId,
                  undefined,
                  undefined,
                  undefined
                );
                updateParticipantById(participant.id as string, {
                  isBeingPlayed: true,
                });
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
            } */
          }
          /* for (let str of streamsList.value) {
            if (!obj.streams.includes(str)) {
              removeRemoteVideo(str);
            }              
          } */

          /* Comentado por la lógica */
          /* participants.value.forEach((participant) => {
            if (!obj.streams.includes(participant.id as string)) {
              removeRemoteVideo(participant.id as string);
            }
          }); */

          //Lastly updates the current streamlist with the fetched one.
          /* streamsList.value = obj.streams; */
        } else if (info == 'data_channel_opened') {
          console.info('Data Channel open for stream id 🃏🃏🃏', obj);

          const user = obj as unknown as string;

          console.log(participants.value, '🅰️');

          if (
            user !== userMe.id &&
            !userMe.isHost &&
            user === roomState.hostId
          ) {
            console.info(
              '⭐ SENDING REQUEST FOR INFO OF PARTICIPANTS IN ROOM',
              obj
            );

            //PIDE INFORMACIÓN DE LOS PARTICIPANTES Y LA SALA SOLO AL HOST PERO TAMBIÉN ENVIA SU PROPIA DATA

            webRTCInstance.value.sendData?.(
              roomState.hostId,
              JSON.stringify({
                eventType: 'PARTICIPANTS_IN_ROOM_INFO_REQUEST',
                from: userMe.id,
                to: roomState.hostId,
                userInfo: userMe,
              })
            );
          }
          if (user === userMe.id && !userMe.isHost) {
            updateUserMe({ isPublishing: 1 });
          }

          //isLoadingOrError.value = false;
          setIsLoadingOrError(false);
          isDataChannelOpen.value = true;
        } else if (info == 'data_channel_closed') {
          console.log('Data Channel closed for stream id', obj);
          // isDataChannelOpen.value = false;
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
            const { notificationType, streamId } = JSON.parse(obj.data) as Data;
            console.log(notificationType);
            if (notificationType == 'CAM_TURNED_ON') {
              //const streamID = obj.streamId;
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              console.log(user);
              if (user) {
                console.log(user);
                user.isCameraOn = true;
                user.isVideoActivated = true;
              }
            } else if (notificationType == 'CAM_TURNED_OFF') {
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              if (user) {
                user.isCameraOn = false;
                user.isVideoActivated = false;
                /*  */
                if (!user.isMicOn) {
                  user.isBeingPlayed = false;
                }
              }
            } else if (notificationType == 'SCREEN_SHARING_ON') {
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              if (user) {
                user.isScreenSharing = true;
                user.isVideoActivated = true;
              }
            } else if (notificationType == 'SCREEN_SHARING_OFF') {
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              if (user) {
                user.isScreenSharing = false;
                user.isVideoActivated = false;
                /*  */
                if (!user.isMicOn) {
                  user.isBeingPlayed = false;
                }
              }
            } else if (notificationType == 'MIC_UNMUTED') {
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              if (user) {
                user.isMicOn = true;
              }
            } else if (notificationType == 'MIC_MUTED') {
              const user = participants.value.find(
                (participant) => participant.id === streamId
              );
              if (user) {
                user.isMicOn = false;
                if (
                  !user.isVideoActivated &&
                  !user.isCameraOn &&
                  !user.isScreenSharing
                ) {
                  user.isBeingPlayed = false;
                }
              }
            } else if (notificationType == 'RECORDING_STARTED') {
              updateRoom({ isBeingRecorded: true });
            } else if (notificationType == 'RECORDING_STOPPED') {
              updateRoom({ isBeingRecorded: false });
              const stateParsed = JSON.parse(
                obj.data
              ) as ObjRecordingStopParsed;

              if (stateParsed?.state?.to === userMe.id)
                window.xprops?.handleStopRecording?.(roomState.recordingUrl);
            }
          } else if (eventType === 'HAND') {
            addHandNotificationInfo(objParsed);
          } else if (eventType === 'NOHAND') {
            removeHandNotification(objParsed.streamId);
          } else if (eventType === 'PARTICIPANTS_IN_ROOM_INFO_REQUEST') {
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

                webRTCInstance.value.sendData?.(
                  roomState.hostId,
                  JSON.stringify({
                    eventType: 'PARTICIPANTS_IN_ROOM_INFO',
                    from: infoRequestParsed.to,
                    to: infoRequestParsed.from,
                    participantsInRoom,
                  })
                );
                console.log('my info have been sent');
              } catch {
                console.info(
                  'The connection is not established yet for sending a petition for INFO_REQUEST'
                );
              }
            }

            const remoteUserInfoParsed = JSON.parse(
              obj.data
            ) as ObjRemoteUserInfo;

            /* const user = participants.value.find(
              (participant) =>
                participant.id === remoteUserInfoParsed.userInfo.id
            ); */
            /* if (user) { */
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
            };

            if (remoteUserInfoParsed.userInfo.existVideo) {
              initRemotePlayerInstance(remoteUserInfoParsed.userInfo);
            }

            participants.value.push(newUser);

            /* } */
          } else if (eventType === 'PARTICIPANTS_IN_ROOM_INFO') {
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
              /* webRTCInstance.value.sendData?.(
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
              ); */
              /* if (user) { */
              console.log('PARTICIPANTS 🥲🥲🥲', participants.value);
              console.log(
                'PARTICIPANTSINROOM 🥲🥲🥲',
                remoteUserInfoParsed.participantsInRoom
              );

              remoteUserInfoParsed.participantsInRoom.forEach(
                (participantInRoom) => {
                  /* const existentParticipant = participants.value.find(
                    (participant) => (participant.id = participantInRoom.id)
                  );
                  const existParticipant = !!existentParticipant;
                  console.log(existentParticipant, 'existent participant');
                  console.log(participantInRoom, 'participant in room');
                  const participantFields = _.clone(participantInRoom);
                  console.log(existParticipant);
                  if (existParticipant) {
                    updateParticipantById(
                      existentParticipant?.id as string,
                      participantFields
                    );
                    console.log('actualiza el participante');
                  } else {
                    addParticipant(participantInRoom);
                    console.log('añade el participante');
                  } */
                  console.log(participantInRoom);
                  console.log(participants.value);
                  const findVal = participants.value.find(
                    (participant) => participant.id === participantInRoom.id
                  );
                  const exist = !!findVal;
                  if (exist) {
                    console.log('exist');
                    updateParticipantById(
                      findVal?.id as string,
                      participantInRoom
                    );
                  } else {
                    participants.value.push(participantInRoom);
                    console.log('doesnt exist');
                  }
                  /* console.log(participantInRoom, 'participant in room 🌐🌐');
                  const existentParticipant = participants.value.find(
                    (participant) => (participant.id = participantInRoom.id)
                  );
                  console.log(existentParticipant, 'existent participant 🌐🌐');
                  const existParticipant = !!existentParticipant;
                  
                  if (existParticipant) {
                    console.log('updating participant');
                    updateParticipantById(
                      participantInRoom.id as string,
                      participantInRoom
                    );
                  } else {
                    console.log('adding participant');
                    addParticipant(participantInRoom);
                  } */
                }
              );

              console.log(
                'PARTICIPANTS IN ROOM 🥲🥲🥲',
                remoteUserInfoParsed.participantsInRoom
              );
              console.log('PARTICIPANTS 🥲🥲🥲', participants.value);

              console.log(admittedParticipants);

              //participants.value = remoteUserInfoParsed.participantsInRoom;

              /* const newUser = {
                id: remoteUserInfoParsed.userInfo.id,
                avatar: remoteUserInfoParsed.userInfo.avatar,
                name: remoteUserInfoParsed.userInfo.name,
                isCameraOn: remoteUserInfoParsed.userInfo.isCameraOn,
                isMicOn: remoteUserInfoParsed.userInfo.isMicOn,
                isScreenSharing: remoteUserInfoParsed.userInfo.isScreenSharing,
                isVideoActivated:
                  remoteUserInfoParsed.userInfo.isVideoActivated,
                isMicBlocked: remoteUserInfoParsed.userInfo.isMicBlocked,
                isCameraBlocked: remoteUserInfoParsed.userInfo.isCameraBlocked,
                isScreenShareBlocked:
                  remoteUserInfoParsed.userInfo.isScreenShareBlocked,
                fractalUserId: remoteUserInfoParsed.userInfo.fractalUserId,
                denied: remoteUserInfoParsed.userInfo.denied,
                isRecording: remoteUserInfoParsed.userInfo.isRecording,
                roleId: remoteUserInfoParsed.userInfo.roleId,
              }; */

              /* console.log(newUser);

              participants.value.push(newUser); */

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

                window.xprops?.addUserLogToState?.(
                  user.fractalUserId,
                  LOG_TYPE.IN
                );
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
              return;
            }

            if (action === LOCK_ACTION_TYPE.All) {
              // setMicBlock(value);
              setRoomMicState(value);
              // setVideoBlock(value);
              setRoomCameraState(value);
              // setScreenShareBlock(value);
              setRoomScreenShareState(value);
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

              if (value) {
                /* setMicIconState(!value); */
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Camera) {
              // setVideoBlock(value);
              setRoomCameraState(value);

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
              // setMicBlock(value);
              setRoomMicState(value);
              // setVideoBlock(value);
              setRoomCameraState(value);
              // setScreenShareBlock(value);
              setRoomScreenShareState(value);

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

              if (value) {
                /* setMicIconState(!value); */
                setMicState(!value);
                muteLocalMic();
                sendNotificationEvent('MIC_MUTED', userMe.id);
              }
            } else if (action === LOCK_ACTION_TYPE.Camera) {
              // setVideoBlock(value);
              setRoomCameraState(value);

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

              if (value) {
                setScreenShareIconState(!value);
                setScreenState(!value);
                setVideoActivatedState(!value);
                resetDesktop();
                sendNotificationEvent('SCREEN_SHARING_OFF', userMe.id);
              }
            }

            // setUserActions(lockData.action, lockData.value);
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
            const userLeavingMsgParsed = JSON.parse(
              obj.data
            ) as ObjUserLeavingMessageParsed;

            removeRemoteVideo(userLeavingMsgParsed.id);

            console.log('USER LEAVING', '🚀🚀🚀');

            if (
              roomState.pinnedUser?.fractalUserId ===
              userLeavingMsgParsed.fractalUserId
            ) {
              window.xprops?.setPinnedUser?.('');
              console.log('Se fue el pinneado');
            }

            window.xprops?.addUserLogToState?.(
              userLeavingMsgParsed.fractalUserId,
              LOG_TYPE.OUT
            );
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
          const errorMessage =
            'Error al publicar stream: Parece que su conexión es lenta, Por favor, recargue la página';
          setLoadingOrErrorMessage(errorMessage);
          setExistRoom(false);
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
