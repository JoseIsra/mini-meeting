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
  HandNotification,
  User,
  Message,
} from '@/types';

// composables
import {
  useUserMe,
  useHandleParticipants,
  useToogleFunctions,
  useHandleMessage,
  useJitsiError,
} from '@/composables';

const roomNameTemporal = ref('');
let connection = reactive<JitsiConnectionRemake>({} as JitsiConnectionRemake);
let room = reactive<JitsiConferenceRemake>({} as JitsiConferenceRemake);
const joined = ref(false);
const { setLocalTracks, localTracks, updateUserMe, userMe } = useUserMe();

const {
  participantAudioTracks,
  participantVideoTracks,
  addParticipant,
  deleteParticipantById,
  findParticipantById,
} = useHandleParticipants();

const {
  addHandNotificationInfo,
  removeHandNotification,
  updateHandNotification,
} = useToogleFunctions();

const { setUserMessage, amountOfNewMessages, acumulateMessages } =
  useHandleMessage();

const { errorsCallback } = useJitsiError();

const handNotificationSound = new Audio(
  'https://freesound.org/data/previews/411/411642_5121236-lq.mp3'
);

export function useJitsi() {
  JitsiMeetJS.init({
    disableAudioLevels: false,
    enableAnalyticsLogging: true,
    enableWindowOnErrorHandler: true,
  });
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  const commandsList = [
    {
      name: 'HAND_UP',
      listener: riseHand,
    },
    {
      name: 'HAND_DOWN',
      listener: downHand,
    },
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
    {
      name: 'INIT_SCREEN_SHARING',
      listener: initScreenSharing,
    },
    {
      name: 'FINISH_SCREEN_SHARING',
      listener: finishScreenSharing,
    },
  ];

  function handleRemoteTracks(track: JitsiRemoteTrack) {
    const participantID = track.getParticipantId();
    console.log('ID DEL REMOTO', participantID);
    console.log('TRACK REMOTO', track);
    console.log('TRACK type REMOTO', track.getType());
    if (track.getType() == 'audio') {
      void nextTick(() => {
        track.attach(participantAudioTracks[`audio-${participantID}`]);
      });
    } else {
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
    videoTrack?.unmute();
  };

  const turnOffLocalCamera = () => {
    const videoTrack = getLocalTrackByType('video');
    videoTrack?.mute();
  };

  const roomAddTrack = (track: JitsiLocalTrack) => {
    void room.addTrack(track);
  };

  function handleLocalTracks(
    tracks: JitsiLocalTrack[] | JitsiConferenceErrors
  ) {
    setLocalTracks(tracks as JitsiLocalTrack[]);
    console.log('PARTICIPANTE UNIDO-TRACKS ENABLE 🚀', joined.value);

    if (joined.value) {
      localTracks.value.forEach((track) => {
        room
          .addTrack(track)
          .then(() => {
            void track.mute();
          })
          .catch((error) => console.log(error));
      });
    }
    // setTimeout(() => {
    //   localTracks.value.forEach((track) => {
    //     void track.mute();
    //   });
    // }, 1000);
  }

  function getLocalTracks() {
    JitsiMeetJS.createLocalTracks({
      devices: ['audio'],
    })
      .then(handleLocalTracks)
      .catch((error: Error) => errorsCallback(error.name, error.message));
  }

  function onConferenceJoined() {
    console.log(' 🚀UNIÉNDOSE A LA CONFERENCIA ');
    joined.value = true;
    getLocalTracks();

    // localTracks.value.forEach((track) => {
    //   void room.addTrack(track);
    //   void track.mute();
    // });
  }

  function onUserJoined(
    _arg: string,
    user: JitsiParticipant & { _tracks: JitsiTrack[] }
  ) {
    // user con display nuevo
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
      fractalUserId: '',
      denied: 1,
      isRecording: false,
      roleId: 1,
      isHost: false,
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
  }

  function onUserLeft(arg: string, participant: JitsiParticipant) {
    console.log('USER LEAVING', {
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

  function initScreenSharing(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isVideoActivated = true;
    }
  }
  function finishScreenSharing(arg: Command) {
    const participant = findParticipantById(arg.value);
    if (participant) {
      participant.isVideoActivated = false;
    }
  }

  function riseHand(arg: Command) {
    handNotificationSound.currentTime = 0;
    void handNotificationSound.play();
    const dataParsed = JSON.parse(arg.value) as HandNotification;
    addHandNotificationInfo(dataParsed);
  }

  function downHand(arg: Command) {
    const dataParsed = JSON.parse(arg.value) as HandNotification;
    if (userMe.id == dataParsed.from) {
      updateHandNotification(false);
    }
    removeHandNotification(dataParsed.from);
  }

  function updateRoomJitsi(arg: User) {
    room.setDisplayName(JSON.stringify(arg));
  }

  function handleMessageReceived(_id: string, chatMessage: string) {
    const chatMessageParsed = JSON.parse(chatMessage) as Message;
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
  }

  function sendNotification(notification: string, arg: Command) {
    room.sendCommandOnce(notification, arg);
  }

  function sendChatMessage(userData: string) {
    room.sendMessage(userData);
  }

  function onSuccessConnection() {
    console.log('Connected succesfull');
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
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track) => {
      console.log('REMOVED mute changed', track);
    });
    room.on(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      onConferenceJoined
    );
    room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    room.on(
      JitsiMeetJS.events.mediaDevices.PERMISSION_PROMPT_IS_SHOWN,
      (arg: string) => {
        console.log('ENVIRONMENT', arg);
      }
    );
    void room.setSenderVideoConstraint(360);
    commandsList.forEach((command) => {
      room.addCommandListener(command.name, command.listener);
    });
    updateUserMe({ id: room.myUserId() });

    room.setDisplayName(JSON.stringify(userMe));
    room.join('');
  }

  function diconnectAll() {
    // apaga room y tracks
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
  };
}
