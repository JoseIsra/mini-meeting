<template>
  <div class="t-cooperate">
    <fu-cooperate />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import FuCooperate from 'organisms/FuCooperate';
import { useRoute } from 'vue-router';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';

interface SoundGainType {
  gain: {
    value: number;
  };
}

interface WebRTCAdaptorType {
  joinRoom?: (roomName: string, streamId: string) => void;
  leaveFromRoom?: (roomName: string) => void;
  getRoomInfo?: (roomName: string, publishStreamId: string) => void;
  publish?: (streamName: string, token: string) => void;
  play?: (
    streamId: string,
    token: string,
    roomId: string,
    subscriberId?: string,
    susbscriberCode?: string
  ) => void;
  turnOffLocalCamera?: () => void;
  turnOnLocalCamera?: () => void;
  sendData?: (publishStreamId: string, notEvent: string) => void;
  switchDesktopCapture?: (publishStreamId: string) => void;
  switchVideoCameraCapture?: (publishStreamId: string, value: string) => void;
  switchDesktopCaptureWithCamera?: (publishStreamId: string) => void;
  muteLocalMic?: () => void;
  unmuteLocalMic?: () => void;
  currentVolume?: number;
  soundOriginGainNode?: SoundGainType;
  secondStreamGainNode?: SoundGainType;
}

interface objWebRTC {
  ATTR_ROOM_NAME: string;
  command: string;
  definition: string;
  room: string;
  streamId: string;
  streams: string[];
  stream: MediaStream;
  event: Record<string, string>;
}

interface StringIndexedArray<TValue> {
  [id: string]: TValue;
}

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
  },
  setup() {
    const route = useRoute();

    const token = ref<string>((route.query.token as string) || '');
    const streamId = ref((route.query.streamId as string) || '');
    const playOnly = ref(!!route.query.playOnly || false);
    const isJoinRoomDisabled = ref(true);
    const isLeaveRoomDisabled = ref(true);
    const isCameraOff = ref(false);
    const isTurnOnCameraDisabled = ref(true);
    const isTurnOffCameraDisabled = ref(true);
    const webRTCAdaptor = ref<WebRTCAdaptorType>({});
    const roomName = ref((route.query.roomName as string) || '');
    const roomOfStream = ref<StringIndexedArray<string>>({});
    const publishStreamId = ref('');
    const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);
    const streamsList = ref<string[]>([]);
    const isScreenShareCheckboxDisabled = ref(true);
    const isCameraCheckboxDisabled = ref(true);
    const isCameraScreenShareCheckboxDisabled = ref(false);
    const objStreams = ref<objWebRTC[]>([]);
    const isDataChannelOpen = ref(false);
    const screenShare = ref(false);
    const camera = ref(false);
    const videoMode = ref('');
    const isMicMuted = ref(false);
    const isMuteMicButtonDisabled = ref(false);
    const isUnmuteMicButtonDisabled = ref(true);
    const currentVolume = ref(0.5);
    const isStreaming = ref(false);

    const handleCameraButtons = () => {
      if (isCameraOff.value) {
        isTurnOffCameraDisabled.value = true;
        isTurnOnCameraDisabled.value = false;
      } else {
        isTurnOffCameraDisabled.value = false;
        isTurnOnCameraDisabled.value = true;
      }
    };

    const joinRoom = () => {
      webRTCAdaptor.value.joinRoom?.(roomName.value, streamId.value);
    };

    const publish = (streamName: string, token: string) => {
      publishStreamId.value = streamName;
      webRTCAdaptor.value.publish?.(streamName, token);
    };

    const removeRemoteVideo = (streamId: string) => {
      objStreams.value = objStreams.value.filter(
        (stream) => stream.streamId !== streamId
      );
    };

    const streamInformation = (obj: objWebRTC) => {
      webRTCAdaptor.value.play?.(obj.streamId, token.value, roomName.value);
    };

    const handleNotificationEvent = (obj: objWebRTC) => {
      const notificationEvent = JSON.parse(obj.event.data) as Record<
        string,
        string
      >;
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

    const sendNotificationEvent = (eventType: string) => {
      if (isDataChannelOpen.value) {
        var notEvent = {
          streamId: publishStreamId.value,
          eventType: eventType,
        };

        webRTCAdaptor.value.sendData?.(
          publishStreamId.value,
          JSON.stringify(notEvent)
        );
      } else {
        console.log(
          'Could not send the notification because data channel is not open.'
        );
      }
    };

    const turnOffLocalCamera = () => {
      webRTCAdaptor.value.turnOffLocalCamera?.();
      isCameraOff.value = true;
      handleCameraButtons();
      sendNotificationEvent('CAM_TURNED_OFF');
    };

    const turnOnLocalCamera = () => {
      webRTCAdaptor.value.turnOnLocalCamera?.();
      isCameraOff.value = false;
      handleCameraButtons();
      sendNotificationEvent('CAM_TURNED_ON');
    };

    const switchVideoMode = () => {
      if (videoMode.value == 'screen') {
        webRTCAdaptor.value.switchDesktopCapture?.(publishStreamId.value);
      } else if (videoMode.value == 'screen+camera') {
        webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(
          publishStreamId.value
        );
      } else {
        webRTCAdaptor.value.switchVideoCameraCapture?.(
          publishStreamId.value,
          videoMode.value
        );
      }
    };

    const handleMicButtons = () => {
      if (isMicMuted.value) {
        isMuteMicButtonDisabled.value = true;
        isUnmuteMicButtonDisabled.value = false;
      } else {
        isMuteMicButtonDisabled.value = false;
        isUnmuteMicButtonDisabled.value = true;
      }
    };

    const muteLocalMic = () => {
      webRTCAdaptor.value.muteLocalMic?.();
      isMicMuted.value = true;
      handleMicButtons();
      sendNotificationEvent('MIC_MUTED');
    };

    const unmuteLocalMic = () => {
      webRTCAdaptor.value.unmuteLocalMic?.();
      isMicMuted.value = false;
      handleMicButtons();
      sendNotificationEvent('MIC_UNMUTED');
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
      webRTCAdaptor.value.leaveFromRoom?.(roomName.value);

      objStreams.value = [];
    };

    onMounted(() => {
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

      /* const startAnimation = () => {
        

		$("#broadcastingInfo")
			.fadeIn(
				800,
				function () {
					$("#broadcastingInfo")
						.fadeOut(
							800,
							function () {
								var state = webRTCAdaptor
									.signallingState(publishStreamId);
								if (state != null
									&& state != "closed") {
									var iceState = webRTCAdaptor
										.iceConnectionState(publishStreamId);
									if (iceState != null
										&& iceState != "failed"
										&& iceState != "disconnected") {
										startAnimation();
									}
								}
							});
				});

	} */

      webRTCAdaptor.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        localVideoId: 'localVideo',
        isPlayMode: playOnly.value,
        debug: true,
        callback: (info: string, obj: objWebRTC) => {
          console.log(info, '🅿️🅿️🅿️');
          if (info == 'initialized') {
            console.log('initialized');
            isJoinRoomDisabled.value = false;
            isLeaveRoomDisabled.value = true;
            if (playOnly.value) {
              isCameraOff.value = true;
            }
            handleCameraButtons();

            //joinRoom();
            /* join_publish_button.disabled = false;
          stop_publish_button.disabled = true; */
            /* if (playOnly) {
            isCameraOff = true;
            handleCameraButtons();
          } */
          } else if (info == 'websocket finally conected') {
            //joinRoom();
            //console.log('finally connected #️⃣#️⃣');
          } else if (info == 'joinedTheRoom') {
            /* var room = obj.ATTR_ROOM_NAME; */
            console.log('joined', obj);
            const room = obj.ATTR_ROOM_NAME;
            const streamId = obj.streamId;
            /* this.roomOfStream[obj.streamId] = room; */
            roomOfStream.value[obj.streamId] = room;
            console.log(`joined the room: ${room}`);

            publishStreamId.value = streamId;

            if (playOnly.value) {
              //join_publish_button.disabled = true;
              isJoinRoomDisabled.value = true;
              //stop_publish_button.disabled = false;
              isLeaveRoomDisabled.value = false;
              isCameraOff.value = true;
              handleCameraButtons();
            } else {
              publish(streamId, token.value);
            }

            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                console.log('Stream joined with ID: ' + item);
                webRTCAdaptor.value.play?.(item, token.value, roomName.value);
              });
              streamsList.value = obj.streams;
            }
            console.log(obj.streams, '🃏🃏🃏🃏🃏🃏🃏');
            roomTimerId.value = setInterval(() => {
              webRTCAdaptor.value.getRoomInfo?.(
                roomName.value,
                publishStreamId.value
              );
            }, 5000);
          } else if (info == 'newStreamAvailable') {
            let isThere = objStreams.value.find(
              (x) => x.streamId === obj.streamId
            );

            if (obj.streamId !== publishStreamId.value) {
              /* const streamVideo = document.getElementById(
                `remoteVideo${obj.streamId}`
              ) as HTMLMediaElement; */
              if (isThere) {
                isThere = obj;
              } else {
                objStreams.value.push(obj);
              }
              //streamVideo.srcObject = obj.stream;
            }

            /* if (!isThere) {
            console.log(
              '🚀 \x1b[32m \x1b[1m ~ file: Streamings.vue ~ line 380 ~ mounted ~ stream',
              obj.stream
            );

            const streamVideo = document.getElementById(
              `remoteStream${obj.streamId}`
            ) as HTMLMediaElement;
            streamVideo.srcObject = obj.stream;

            this.objStreams.push(obj);
          } */

            /* playVideo(obj); */
          } else if (info == 'publish_started') {
            //stream is being published
            console.debug(
              'publish started to room: ' + roomOfStream.value[obj.streamId]
            );
            isJoinRoomDisabled.value = true;
            isLeaveRoomDisabled.value = false;
            isStreaming.value = true;
          } else if (info == 'publish_finished') {
            isStreaming.value = false;
            //stream is being finished
            console.debug('publish finished');
          } else if (info == 'screen_share_stopped') {
            console.log('screen share stopped');
          } else if (info == 'browser_screen_share_supported') {
            isScreenShareCheckboxDisabled.value = false;
            isCameraCheckboxDisabled.value = false;
            isCameraScreenShareCheckboxDisabled.value = false;

            console.log('browser screen share supported');
          } else if (info == 'leavedFromRoom') {
            var room = obj.ATTR_ROOM_NAME;
            console.debug('leaved from the room:' + room);
            if (roomTimerId.value != null) {
              clearInterval(roomTimerId.value);
            }
            isJoinRoomDisabled.value = false;
            isLeaveRoomDisabled.value = true;

            if (streamsList.value != null) {
              /* this.streamsList.forEach(function (item) {
              removeRemoteVideo(item);
            }); */
            }
            // we need to reset streams list
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
            for (let str of obj.streams) {
              if (!streamsList.value.includes(str)) {
                webRTCAdaptor.value.play?.(str, token.value, roomName.value);
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
            console.log('Data Channel open for stream id', obj);
            isDataChannelOpen.value = true;
          } else if (info == 'data_channel_closed') {
            console.log('Data Channel closed for stream id', obj);
            isDataChannelOpen.value = false;
          } else if (info == 'data_received') {
            handleNotificationEvent(obj);
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

            //screen_share_checkbox.checked = false;
            screenShare.value = false;
            camera.value = false;
            //camera_checkbox.checked = false;
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
            //screen_share_checkbox.checked = false;
            screenShare.value = false;
            camera.value = true;
            //camera_checkbox.checked = true;
          }
          alert(errorMessage);
        },
      }) as WebRTCAdaptorType;

      //webRTCAdaptor.value = localWebRTCAdaptor;
    });

    return {
      currentVolume,
      objStreams,
      roomName,
      isJoinRoomDisabled,
      joinRoom,
      isLeaveRoomDisabled,
      isTurnOffCameraDisabled,
      turnOffLocalCamera,
      isTurnOnCameraDisabled,
      turnOnLocalCamera,
      isMuteMicButtonDisabled,
      muteLocalMic,
      isUnmuteMicButtonDisabled,
      unmuteLocalMic,
      isCameraCheckboxDisabled,
      videoMode,
      switchVideoMode,
      isScreenShareCheckboxDisabled,
      isCameraScreenShareCheckboxDisabled,
      changeVolume,
      isStreaming,
      leaveRoom,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
