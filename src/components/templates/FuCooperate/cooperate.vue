<template>
  <div class="t-cooperate">
    <fu-cooperate
      :toggleLocalCamera="toggleLocalCamera"
      :toggleLocalMic="toggleLocalMic"
      :objStreams="objStreams"
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
import { usePerifericsControls } from '@/componsables';

import { ZoidWindow } from '@/types/zoid';

import FuTLoading from 'organisms/FuLoading';

interface StringIndexedArray<TValue> {
  [id: string]: TValue;
}

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
  },
  setup() {
    let { perifericsControl } = usePerifericsControls();
    const route = useRoute();

    const roomId =
      (window as ZoidWindow)?.xprops?.roomId ||
      (route.query.roomId as string) ||
      '';
    const publishToken =
      (window as ZoidWindow)?.xprops?.publishToken ||
      (route.query.publishToken as string) ||
      '';
    const playToken =
      (window as ZoidWindow)?.xprops?.playToken ||
      (route.query.playToken as string) ||
      '';
    const streamId =
      (window as ZoidWindow)?.xprops?.streamId ||
      (route.query.streamId as string) ||
      '';
    /* const playOnly = ref(!!route.query.playOnly || false);
    const isCameraOff = ref(false); */
    const webRTCAdaptor = ref<WebRTCAdaptorType>({});

    const roomOfStream = ref<StringIndexedArray<string>>({});
    const publishStreamId = ref('');
    const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);
    const streamsList = ref<string[]>([]);
    const objStreams = ref<objWebRTC[]>([]);
    const isDataChannelOpen = ref(false);
    const camera = ref(false);
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
    const streamName = ref<string | undefined>(
      (window as ZoidWindow)?.xprops?.streamName ||
        (route.query.streamName as string) ||
        undefined
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
      console.log(
        perifericsControl.isCameraOn,
        perifericsControl.isScreenShared
      );
      if (perifericsControl.isScreenShared) {
        console.log('DESACTIVAO');
        webRTCAdaptor.value.resetDesktop?.();
      }
      if (perifericsControl.isCameraOn && !perifericsControl.isScreenShared) {
        //si no se comparte, compartir pantalla
        // webRTCAdaptor.value.turnOnLocalCamera?.();
        webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
        webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(streamId);
        /* webRTCAdaptor.value.switchDesktopCapture?.(publishStreamId.value); */
      } else if (
        !perifericsControl.isCameraOn &&
        !perifericsControl.isScreenShared
      ) {
        //webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
        webRTCAdaptor.value.switchDesktopCapture?.(streamId);
      } else if (
        perifericsControl.isCameraOn &&
        perifericsControl.isScreenShared
      ) {
        //webRTCAdaptor.value.resetDesktop?.();
        webRTCAdaptor.value.switchVideoCameraCapture?.(
          publishStreamId.value,
          cameraId
        );
      }

      if (!perifericsControl.isCameraOn && perifericsControl.isScreenShared) {
        webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
      } else {
        webRTCAdaptor.value.justTurnOnLocalCamera?.(streamId);
      }

      // if (isSharingDesktop.value) {
      //   if (isCameraOff.value) {
      //     webRTCAdaptor.value.turnOnLocalCamera?.();
      //     isCameraOff.value = false;
      //     sendNotificationEvent('CAM_TURNED_ON');
      //   } else {
      //     console.log('here here ');
      //     webRTCAdaptor.value.turnOffLocalCamera?.();
      //     isCameraOff.value = true;
      //   }
      //   isSharingDesktop.value = false;
      // } else {
      //   if (isCameraOff.value) {
      //     webRTCAdaptor.value.switchDesktopCapture?.(publishStreamId.value);
      //     console.log('here here here');
      //     isCameraOff.value = false;
      //   } else {
      //     webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(
      //       publishStreamId.value
      //     );
      //     isCameraOff.value = true;
      //   }
      //   isSharingDesktop.value = true;
      // }
    };

    const toggleLocalCamera = () => {
      // if (!perifericsControl.isCameraOn && !perifericsControl.isScreenShared) {
      // si esta apagada sin proyección de escritorio, encender camara
      //   webRTCAdaptor.value.turnOnLocalCamera?.();
      //   sendNotificationEvent('CAM_TURNED_ON');
      // } else if (
      //   perifericsControl.isCameraOn &&
      //   !perifericsControl.isScreenShared
      // ) {
      //   console.log('apagando camara');
      //   webRTCAdaptor.value.turnOffLocalCamera?.();
      //   sendNotificationEvent('CAM_TURNED_OFF');
      // } else if (
      //   !perifericsControl.isCameraOn &&
      //   perifericsControl.isScreenShared
      // ) {
      //   webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(
      //     publishStreamId.value
      //   );
      // } else if (
      //   perifericsControl.isCameraOn &&
      //   perifericsControl.isScreenShared
      // ) {
      //   webRTCAdaptor.value.turnOffLocalCamera?.();
      //   sendNotificationEvent('CAM_TURNED_OFF');
      // }
      if (perifericsControl.isCameraOn) {
        console.log('APAGA CAMARA', perifericsControl.isScreenShared);

        if (perifericsControl.isScreenShared) {
          webRTCAdaptor.value.switchDesktopCapture?.(publishStreamId.value);
        } else {
          webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
          sendNotificationEvent('CAM_TURNED_OFF');
        }
      } else {
        console.log('PRENDE');
        if (perifericsControl.isScreenShared) {
          webRTCAdaptor.value.switchDesktopCaptureWithCamera?.(streamId);
        } else {
          webRTCAdaptor.value.turnOnLocalCamera?.(streamId);
        }
        sendNotificationEvent('CAM_TURNED_ON');
      }
    };
    const toggleLocalMic = () => {
      if (!perifericsControl.isMicOn) {
        webRTCAdaptor.value.unmuteLocalMic?.();
        sendNotificationEvent('MIC_UNMUTED');
      } else {
        webRTCAdaptor.value.muteLocalMic?.();
        sendNotificationEvent('MIC_MUTED');
      }

      // if (isMicMuted.value) {
      //   webRTCAdaptor.value.unmuteLocalMic?.();
      //   isMicMuted.value = false;
      //   handleMicButtons();
      //   sendNotificationEvent('MIC_UNMUTED');
      // } else {
      //   webRTCAdaptor.value.muteLocalMic?.();
      //   isMicMuted.value = true;
      //   handleMicButtons();
      //   sendNotificationEvent('MIC_MUTED');
      // }
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
      publishStreamId.value = streamId;
      webRTCAdaptor.value.publish?.(
        streamId,
        token,
        subscriberId,
        subscriberCode,
        streamName
      );
    };

    const removeRemoteVideo = (streamId: string) => {
      objStreams.value = objStreams.value.filter(
        (stream) => stream.streamId !== streamId
      );
    };

    const streamInformation = (obj: objWebRTC) => {
      webRTCAdaptor.value.play?.(obj.streamId, playToken, roomId);
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

      objStreams.value = [];
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
        initCameraState: perifericsControl.isCameraOn,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            console.log('initialized');
            /* if (playOnly.value) {
              isCameraOff.value = false;
            } */
            // load all
            if (!perifericsControl.isCameraOn) {
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

            publishStreamId.value = streamId;

            /* if (playOnly.value) {              
              isCameraOff.value = true;
            } else {
              } */
            publish(
              streamId,
              publishToken,
              subscriberId.value,
              subscriberCode.value,
              streamName.value
            );

            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                console.log('Stream joined with ID: ' + item);
                webRTCAdaptor.value.play?.(item, playToken, roomId);
              });
              streamsList.value = obj.streams;
            }
            roomTimerId.value = setInterval(() => {
              webRTCAdaptor.value.getRoomInfo?.(roomId, publishStreamId.value);
            }, 5000);
          } else if (info == 'newStreamAvailable') {
            let isThere = objStreams.value.find(
              (x) => x.streamId === obj.streamId
            );

            if (obj.streamId !== publishStreamId.value) {
              if (isThere) {
                isThere = obj;
              } else {
                objStreams.value.push(obj);
              }
            }
          } else if (info == 'publish_started') {
            //stream is being published
            console.debug(
              'publish started to room: ' + roomOfStream.value[obj.streamId]
            );
          } else if (info == 'publish_finished') {
            //stream is being finished
            console.debug('publish finished');
          } else if (info == 'screen_share_stopped') {
            console.log('screen share stopped');
            perifericsControl.isScreenShared = false;
            if (!perifericsControl.isCameraOn) {
              perifericsControl.isVideoActivated = false;
              webRTCAdaptor.value.turnOffLocalCamera?.(streamId);
            }
          } else if (info == 'browser_screen_share_supported') {
            //enable camera and screenshare

            console.log('browser screen share supported');
          } else if (info == 'leavedFromRoom') {
            var room = obj.ATTR_ROOM_NAME;
            console.debug('leaved from the room:' + room);
            if (roomTimerId.value != null) {
              clearInterval(roomTimerId.value);
            }

            if (streamsList.value != null) {
              /* this.streamsList.forEach(function (item) {
              removeRemoteVideo(item);
            }); */
            }
            // we need to reset streams list
            objStreams.value = [];
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

            camera.value = false;
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
            camera.value = true;
          }
          console.log(errorMessage);
          //alert(errorMessage);
        },
      }) as WebRTCAdaptorType;
    };

    const loadingMessage = ref('Loading');
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

      return res.status;
    };

    /* conditionals */
    if (roomId) {
      checkRoom(roomId)
        .then((status) => {
          if (status === 200) {
            existRoom.value = true;
          } else if (status === 404) {
            loadingMessage.value = 'Meeting not found';
          } else if (status === 403) {
            loadingMessage.value = 'Not allowed';
          }
        })
        .catch((error) => console.log(error));
    }

    //TODO: Dont dissapear loading until the host accept the user. Needed to implement logic for that (dont publish neither play streams)

    const fuCooperateMountedHandler = () => {
      createConnection();
      isLoadingOrError.value = false;
    };

    onUnmounted(() => {
      leaveRoom();
    });

    return {
      fuCooperateMountedHandler,
      isLoadingOrError,
      loadingMessage,
      existRoom,
      currentVolume,
      objStreams,
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
