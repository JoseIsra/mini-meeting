import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { useUserMe } from '@/composables/userMe';
import { objWebRTC } from '@/types/index';
import { StreamMerger } from '@/utils/webrtc/stream_merger';

const webRTCInstaceForMerge = ref<WebRTCAdaptor>({} as WebRTCAdaptor);
const noStream = ref<boolean>(false);

const { userMe, setScreenState, setVideoActivatedState } = useUserMe();

const roomIdState = ref<string>('');

const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);

const streamsList = ref([] as string[]);

const isDataChannelOpen = ref(false);

interface objMessage {
  eventType: string;
}

export function useInitMerge() {
  const merger = new StreamMerger(1280, 720, true, '16:9');

  const mergeStreams = (streamId: string, streamName: string) => {
    const delayInMilliseconds = 3500;

    setTimeout(() => {
      merger.start();
      const result = merger.getResult() as MediaStream;
      console.log(result);
      webRTCInstaceForMerge.value.gotStream(result);

      if (streamsList.value.length > 0) {
        publish(streamId, undefined, undefined, undefined, streamName);
        noStream.value = false;
      } else {
        console.log('There is no stream available in the room');
        noStream.value = true;
      }
    }, delayInMilliseconds);
  };

  /*  */

  const joinRoom = (roomId: string, streamId: string) => {
    webRTCInstaceForMerge.value.joinRoom?.(roomId, streamId, 'legacy');
  };

  const publish = (
    streamId: string,
    token?: string,
    subscriberId?: string,
    subscriberCode?: string,
    streamName?: string
  ) => {
    streamId = streamId;
    webRTCInstaceForMerge.value.publish?.(
      streamId,
      token,
      subscriberId,
      subscriberCode,
      streamName
    );
  };

  const streamInformation = (
    obj: objWebRTC,
    roomId: string,
    playToken?: string
  ) => {
    webRTCInstaceForMerge.value.play?.(
      obj.streamId,
      playToken,
      roomId,
      undefined,
      undefined,
      undefined
    );
  };

  const leaveRoom = (roomId: string) => {
    webRTCInstaceForMerge.value.leaveFromRoom?.(roomId);
  };

  const createMergeInstance = (
    roomId: string,
    streamId: string,
    streamName: string,
    publishToken?: string,
    playToken?: string,
    subscriberId?: string,
    subscriberCode?: string
  ) =>
    new Promise((resolve, reject) => {
      roomIdState.value = roomId;

      const websocketURL = 'wss://dialguiba.tech/WebRTCAppEE/websocket';

      console.log(publishToken, subscriberId, subscriberCode);

      let oldId = '';
      let xindex = 0;
      let yindex = 0;

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

      webRTCInstaceForMerge.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        localVideoId: 'localVideo2',
        isPlayMode: true,
        debug: true,
        initCameraState: userMe.isCameraOn,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            console.log('initialized');

            if (!userMe.isCameraOn) {
              webRTCInstaceForMerge.value.turnOffLocalCamera?.(streamId);
            }
            joinRoom(roomId, streamId);
          } else if (info == 'joinedTheRoom') {
            window.addEventListener('unload', () => {
              leaveRoom(roomId);
            });
            console.log('joined', obj);

            const streamId = obj.streamId;

            mergeStreams(streamId, streamName);

            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                console.log('Stream joined with ID: ' + item);
                webRTCInstaceForMerge.value.play(
                  item,
                  playToken,
                  roomId,
                  undefined,
                  undefined,
                  undefined
                );
              });
              streamsList.value = obj.streams;
            }
            roomTimerId.value = setInterval(() => {
              webRTCInstaceForMerge.value.getRoomInfo?.(roomId, streamId);
            }, 2000);
          } else if (info == 'newStreamAvailable') {
            if (noStream.value) {
              mergeStreams(streamId, streamName);
            }
            noStream.value = false;
            if (oldId !== obj.streamId) {
              merger.addStream(obj.stream, {
                Xindex: xindex,
                Yindex: yindex,
                streamId: obj.streamId,
              });
              if (xindex == 3) {
                yindex++;
                xindex = 0;
              }
              xindex++;
            }
            oldId = obj.streamId;
          } else if (info == 'publish_started') {
            console.debug('publish started');
          } else if (info == 'publish_finished') {
            console.debug('publish finished');
          } else if (info == 'screen_share_stopped') {
            console.log('screen share stopped');
            setScreenState(false);
            if (!userMe.isCameraOn) {
              userMe.isVideoActivated = false;
              webRTCInstaceForMerge.value.turnOffLocalCamera?.(streamId);
            }
            webRTCInstaceForMerge.value.resetDesktop?.();
          } else if (info == 'ScreenShareStarted') {
            setVideoActivatedState(true);
          } else if (info == 'browser_screen_share_supported') {
            console.log('browser screen share supported');
          } else if (info == 'leavedFromRoom') {
            const room = obj.ATTR_ROOM_NAME;
            console.debug('leaved from the room:' + room);
            if (roomTimerId.value != null) {
              clearInterval(roomTimerId.value);
            }
          } else if (info == 'closed') {
            if (typeof obj != 'undefined') {
              console.log('Connecton closed: ' + JSON.stringify(obj));
            }
          } else if (info == 'play_finished') {
            merger.removeStream(obj.streamId);
          } else if (info == 'streamInformation') {
            streamInformation(obj, roomId, playToken);
          } else if (info == 'roomInformation') {
            const tempRoomStreamList = [];

            if (streamsList.value != null) {
              for (let i = 0; i < streamsList.value.length; i++) {
                const oldStreamListItem = streamsList.value[i];
                const newRoomItemIndex = obj.streams.indexOf(oldStreamListItem);

                // If streams item is in obj.streams, it's
                if (obj.streams.includes(oldStreamListItem)) {
                  if (newRoomItemIndex > -1) {
                    obj.streams.splice(newRoomItemIndex, 1);
                  }
                  tempRoomStreamList.push(oldStreamListItem);
                } else {
                  //removeRemoteVideo(oldStreamListItem);
                }
              }
            }

            //Play new streams in list
            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                tempRoomStreamList.push(item);
                webRTCInstaceForMerge.value.play(
                  item,
                  playToken,
                  roomId,
                  undefined,
                  undefined,
                  undefined
                );
              });
            }
            streamsList.value = tempRoomStreamList;
          } else if (info == 'data_channel_opened') {
            console.info('Data Channel open for stream id 🃏🃏🃏', obj);
          } else if (info == 'data_channel_closed') {
            console.log('Data Channel closed for stream id', obj);
            isDataChannelOpen.value = false;
          } else if (info == 'data_received') {
            console.log(obj);
            const { eventType } = JSON.parse(obj.data) as objMessage;
            if (eventType === 'USER_INFO_REQUEST') {
              resolve('SUCCESS');
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
            webRTCInstaceForMerge.value.turnOffLocalCamera?.(streamId);
            webRTCInstaceForMerge.value.resetDesktop?.();
          }
          console.log(errorMessage);
          reject(errorMessage);
          //alert(errorMessage);
        },
      });
    });

  const stopMerge = () => {
    webRTCInstaceForMerge.value.leaveFromRoom(roomIdState.value);
    merger.stop();
  };

  return {
    createMergeInstance,
    stopMerge,
  };
}
