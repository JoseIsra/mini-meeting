import { reactive, ref, nextTick } from 'vue';
import JitsiMeetJS from '@solyd/lib-jitsi-meet';
import options from '@/config/jitsiOptions';
import JitsiLocalTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiLocalTrack';
import { JitsiConferenceErrors } from '@solyd/lib-jitsi-meet/dist/esm/JitsiConferenceErrors';
import JitsiParticipant from '@solyd/lib-jitsi-meet/dist/esm/JitsiParticipant';
import JitsiRemoteTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiRemoteTrack';
import JitsiTrack from '@solyd/lib-jitsi-meet/dist/esm/modules/RTC/JitsiTrack';
import {
  Command,
  JitsiConferenceRemake,
  JitsiConnectionRemake,
  User,
  RecordConference,
} from '@/types';

// composables
import {
  useUserMe,
  useHandleParticipants,
  useAuthState,
  useExternalVideo,
  useRoom,
} from '@/composables';
import { useJitsiError } from '@/composables/jitsiError';
import { useUserColor } from '@/composables/userColor';

import { MediaType } from '@/utils/enums';

const roomNameTemporal = ref('');
let connection = reactive<JitsiConnectionRemake>({} as JitsiConnectionRemake);
let room = reactive<JitsiConferenceRemake>({} as JitsiConferenceRemake);
const joined = ref(false);
const {
  setLocalTracks,
  localTracks,
  updateUserMe,
  userMe,
  // setCameraState,
  // localVideoTrack,
} = useUserMe();

const {
  participantAudioTracks,
  participantVideoTracks,
  addParticipant,
  deleteParticipantById,
  findParticipantById,
} = useHandleParticipants();

const { externalVideo } = useExternalVideo();

const { errorsCallback } = useJitsiError();
const { setIsLoadingOrError } = useAuthState();
const { setUserBackgroundColor } = useUserColor();
const { setRecordSessionId, recordSessionID } = useRoom();

export function useJitsi() {
  console.log('ℹ️LINE 64, init jitsi composable');
  JitsiMeetJS.init({
    disableAudioLevels: false,
    enableAnalyticsLogging: true,
    enableWindowOnErrorHandler: true,
  });
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  const commandsList = [
    {
      name: 'TURN_OFF_CAMERA',
      listener: turnOffRemoteCamera,
    },
    {
      name: 'TURN_ON_CAMERA',
      listener: turnOnRemoteCamera,
    },
    {
      name: 'TURN_ON_MIC',
      listener: turnOnRemoteMic,
    },
    {
      name: 'TURN_OFF_MIC',
      listener: turnOffRemoteMic,
    },
  ];

  function handleRemoteTracks(track: JitsiRemoteTrack) {
    const participantID = track.getParticipantId();
    console.log('HANDLE TRACKS REMOTOS ID Y TYPE-> ID-TYPE', {
      participantID,
      type: track.getType(),
    });
    if (track.getType() == 'audio') {
      console.log('ℹ️ line 98 SET AUDIO TRACK');
      void nextTick(() => {
        track.attach(participantAudioTracks[`audio-${participantID}`]);
      });
    } else {
      console.log('ℹ️ line 103 set VIDEO TRACK');
      void nextTick(() => {
        track.attach(participantVideoTracks[`video-${participantID}`]);
      });
    }
  }

  const getLocalTrackByType = (type: string) => {
    return localTracks.value.find((track) => track.getType() == type);
  };

  const turnOnLocalMic = () => {
    const audioTrack = getLocalTrackByType('audio');
    audioTrack?.unmute();
  };

  const turnOffLocalMic = () => {
    const audioTrack = getLocalTrackByType('audio');
    audioTrack?.mute();
  };

  const turnOnLocalCamera = () => {
    const videoTrack = getLocalTrackByType('video');
    videoTrack
      ?.unmute()
      .then(() => {
        updateUserMe({ isPublishing: 1 });
      })
      .catch((error) => console.error(error));
  };

  const turnOffLocalCamera = () => {
    const videoTrack = getLocalTrackByType('video');
    videoTrack?.mute();
  };
  // const resetDesktop = async () => {
  //   if (localTracks.value[1]) {
  //     if (userMe.isCameraOn) {
  //       setCameraState(false);
  //     }
  //     localTracks.value[1].dispose();
  //     void localTracks.value.pop();
  //   }
  //   const cameraTrack = (await JitsiMeetJS.createLocalTracks({
  //     devices: ['video'],
  //   })) as JitsiLocalTrack[];
  //   localTracks.value.push(cameraTrack[0]);
  //   void nextTick(() => {
  //     localTracks.value[1].attach(localVideoTrack.value);
  //   });

  //   void room.addTrack(localTracks.value[1]);
  //   void localTracks.value[1].mute();
  // };

  const roomAddTrack = (
    track: JitsiLocalTrack,
    callback: (() => void) | null
  ) => {
    // void room.replaceTrack(track, thenew);
    void room.addTrack(track);
    setTimeout(() => {
      callback && callback();
    }, 1200);
  };

  // TODO:THIS IS A FAILED EXPERIMENT TO SHARE A BROWSER TAB WITH ADIO
  const testReplaceAudio = (
    oldaudio: JitsiLocalTrack & { stream?: MediaStream },
    newAudio: JitsiLocalTrack & { stream?: MediaStream },
    flag?: boolean
  ) => {
    const damn = JitsiMeetJS.createAudioMixer();
    damn.addMediaStream(newAudio.stream as MediaStream);
    damn.addMediaStream(oldaudio.stream as MediaStream);
    const started = damn.start();
    console.debug(started);
    // ADDTRACK ITS NOW WORKING WITH AUDIO
    if (flag) {
      void room.replaceTrack(room.getLocalTracks(MediaType.AUDIO)[0], oldaudio);
    } else {
      // await oldaudio.setEffect(started);
      // REPLACE TRACK ITS NOT FULLY WORKING
      void room.replaceTrack(oldaudio, newAudio);
    }
  };

  const getMediaTrack = (mediaType: MediaType) => {
    return room.getLocalTracks(mediaType)[0];
  };

  const replaceLocalTrack = (
    theTrach: JitsiLocalTrack,
    mediaType: MediaType
  ) => {
    const track = getMediaTrack(mediaType); // audio o video
    void room.replaceTrack(track, theTrach);
    console.log('LOCAL TRACKS DE VIDEO', room.getLocalTracks(MediaType.VIDEO));
  };

  function handleLocalTracks(
    tracks: JitsiLocalTrack[] | JitsiConferenceErrors
  ) {
    console.log('ℹ️LINE 206->Renderiza conferencia, TRACKS RECIVIDOS', tracks);
    // show conference
    setIsLoadingOrError(false);

    if (!tracks.length) return;
    console.log('ℹ️ 211 seteando localtracks');
    setLocalTracks(tracks as JitsiLocalTrack[]);
    console.log(
      'ℹ️line 213->PARTICIPANT JOINED-TRACKS ENABLE 🚀',
      joined.value
    );

    if (joined.value) {
      localTracks.value.forEach((track) => {
        room
          .addTrack(track)
          .then(() => {
            void track.mute();
          })
          .catch((error) => console.error(error));
      });
    }
  }

  function getLocalTracks(constraints = ['video', 'audio']) {
    JitsiMeetJS.createLocalTracks({
      devices: constraints,
    })
      .then(handleLocalTracks)
      .catch((error: Error) => {
        errorsCallback(error.name, error.message);
      });
  }

  // function requestInformationOnRoom() {
  //   if (!userMe.isHost) {
  //     sendNotification('REQUEST_ROOM_STATE', { value: JSON.stringify(userMe) });
  //   }
  // }

  function onConferenceJoined() {
    console.log(
      'Uniendose a la conferencia, EVENTO CONFERENCE_JOINED, seteando joined a TRUE'
    );
    joined.value = true;
    getLocalTracks();
    // requestInformationOnRoom();
  }

  function onUserJoined(
    _arg: string,
    user: JitsiParticipant & { _tracks: JitsiTrack[] }
  ) {
    console.log('CREANDO USUARIO PARA LA SALA, EVENTO: USER JOINED', {
      id: _arg,
      user,
      date: Date.now(),
    });
    if (!user.getDisplayName()) return;
    const dataUser = JSON.parse(user.getDisplayName()) as User;
    addParticipant({
      id: dataUser.id,
      name: dataUser.name,
      avatar:
        'https://encrypted.fractalup.com/file/FractalUp/Logos/logo_azul.svg',
      isCameraOn: dataUser.isCameraOn,
      isMicOn: dataUser.isMicOn,
      isScreenSharing: dataUser.isScreenSharing,
      isVideoActivated: dataUser.isVideoActivated,
      isMicBlocked: false,
      isCameraBlocked: false,
      isScreenShareBlocked: false,
      fractalUserId: dataUser.fractalUserId,
      denied: 1,
      isRecording: false,
      roleId: dataUser.roleId,
      isHost: dataUser.isHost,
      isPublishing: 0, // 0 -> off / 1 -> on / 2 -> loading . For my own user
      hasLogJoin: false, // Specially for others users because mine just log one time
      speakerId: '',
      cameraId: '',
      micId: '',
      canDraw: false,
      hasWebcam: dataUser.hasWebcam,
      hasMic: dataUser.hasMic,
      isVideoOwner: false,
      tracks: user._tracks,
    });
    setUserBackgroundColor(dataUser.id);
    console.debug(dataUser);
  }

  function onUserLeft(arg: string, participant: JitsiParticipant) {
    console.log('USER LEAVING', {
      date: Date.now(),
      id: arg,
      who: participant,
    });
    deleteParticipantById(arg);
  }

  function turnOffRemoteCamera(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isCameraOn = false;
      participant.isVideoActivated = false;
    }
  }
  function turnOnRemoteCamera(arg: Command) {
    const participant = findParticipantById(arg.value);
    // test feature
    if (participant) {
      participant.isCameraOn = true;
      participant.isVideoActivated = true;
    }
  }
  function turnOnRemoteMic(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isMicOn = true;
    }
  }
  function turnOffRemoteMic(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isMicOn = false;
    }
  }

  function updateRoomJitsi(arg: User) {
    room.setDisplayName(JSON.stringify(arg));
  }

  function sendNotification(notification: string, arg: Command) {
    room.sendCommandOnce(notification, arg);
  }

  function sendChatMessage(userData: string) {
    room.sendMessage(userData);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function requestRoomState(_arg: Command) {
    if (userMe.isHost) {
      if (externalVideo.videoOnRoom) {
        sendNotification('SEND_ROOM_INFO', {
          value: JSON.stringify(externalVideo),
          attributes: { type: 'video' },
        });
      }
    }
  }

  function initRecord() {
    room
      .startRecording({
        openBridgeChannel: true,
        mode: 'file',
        appData: null,
      })
      .then((info) => {
        const parseInfo = info as RecordConference;
        console.log('INFO RECORDING', info);
        console.log('SESSIONID', parseInfo._sessionID);
        setRecordSessionId(parseInfo._sessionID);
      })
      .catch((error) => console.error(error));
  }
  function finishRecord() {
    room
      .stopRecording(recordSessionID.value)
      .then((info) => {
        console.log('END RECORDING', info);
      })
      .catch((error) => console.error(error));
  }

  function onSuccessConnection() {
    console.log('CONEXIÓN EXITOSA');
    // init room
    room = connection.initJitsiConference(roomNameTemporal.value, {
      p2p: {
        enabled: false,
      },
    });

    room.on(
      JitsiMeetJS.events.conference.TRACK_ADDED,
      (track: JitsiRemoteTrack) => {
        !track.isLocal() && handleRemoteTracks(track);
      }
    );
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
      console.log('REMOVED TRACK', track);
    });
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(
      JitsiMeetJS.events.conference.KICKED,
      (actor: unknown, reason: string) => {
        console.table({ actor, reason });
      }
    );
    void room.setSenderVideoConstraint(360);
    commandsList.forEach((command) => {
      room.addCommandListener(command.name, command.listener);
    });
    updateUserMe({ id: room.myUserId() });
    setUserBackgroundColor(userMe.id);
    room.setDisplayName(JSON.stringify(userMe));
    room.join('');
  }

  function diconnectAll() {
    localTracks.value.forEach((track) => {
      track.dispose();
    });
    if (room) void room.leave();

    if (connection) void connection.disconnect();
  }

  const stablisConnection = (roomName: string) => {
    roomNameTemporal.value = roomName;
    const jitsiOptions = { ...options };
    jitsiOptions.serviceUrl = `${jitsiOptions.serviceUrl}?room=${roomName}`;
    connection = new JitsiMeetJS.JitsiConnection(
      '',
      null,
      jitsiOptions
    ) as JitsiConnectionRemake;
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      onSuccessConnection
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => {
        console.log('The connection failed.');
      }
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      diconnectAll
    );

    connection.connect({});
  };

  return {
    stablisConnection,
    diconnectAll,
    turnOnLocalMic,
    turnOffLocalMic,
    turnOnLocalCamera,
    turnOffLocalCamera,
    sendNotification,
    roomAddTrack,
    updateRoomJitsi,
    sendChatMessage,
    getLocalTracks,
    testReplaceAudio,
    replaceLocalTrack,
    initRecord,
    finishRecord,
  };
}
