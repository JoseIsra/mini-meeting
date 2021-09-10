<template>
  <div>
    <q-dialog v-model="layout">
      <q-layout
        view="Lhh lpR fff"
        container
        class="bg-white fit"
        :style="{ 'max-height': '330px' }"
      >
        <q-header class="bg-primary">
          <q-toolbar>
            <!-- <q-btn flat @click="drawerR = !drawerR" round dense icon="menu" /> -->
            <q-toolbar-title>Retransmitir en Redes Sociales</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>

        <q-drawer
          bordered
          v-model="drawerR"
          :width="200"
          :breakpoint="300"
          class="bg-grey-3 q-pa-sm"
        >
          <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
        </q-drawer>

        <q-page-container>
          <q-page
            :style="{
              padding: '20px',
              display: 'flex',
              'flex-direction': 'column',
              gap: '35px',
              'justify-content': 'center',
            }"
          >
            <q-input
              filled
              v-model="endpoint"
              label="Endpoint (rtmps://live-api-s.facebook.com:443/rtmp)"
            />
            <q-input
              filled
              v-model="key"
              label="Key (FB-12341432344535255-3234-323)"
            />
            <q-btn
              v-show="!isStreaming"
              color="primary"
              label="Transmitir"
              @click="handleStartTransmission"
            />
            <q-btn
              v-show="isStreaming"
              color="negative"
              label="Detener transmisión"
              @click="handleEndTransmission"
            />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { defineComponent, ref, computed, onMounted } from 'vue';
import { StreamMerger } from '@/utils/webrtc/stream_merger';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { objWebRTC, WebRTCAdaptorType } from '@/types/index';
import '@/composables/';
import { ZoidWindow } from '@/types/zoid';
import { useUserMe } from '@/composables/userMe';

interface StringIndexedArray<TValue> {
  [id: string]: TValue;
}

export default defineComponent({
  name: 'FuOModal',
  setup() {
    const { userMe } = useUserMe();
    const moreContent = ref(true);
    const layout = ref(false);
    const webRTCAdaptorMerged = ref<WebRTCAdaptorType>({});

    const endpoint = ref('');
    const key = ref('');

    const isStreaming = ref(false);

    const openModal = () => {
      layout.value = true;
    };
    /*  */
    /*  */
    const merger = new StreamMerger(320, 240, true, '4:3');
    const roomTimerId = ref<ReturnType<typeof setInterval> | null>(null);
    //TODO: Cambiar por el estado de sala global
    const roomNameBox = (window as ZoidWindow).xprops?.roomId as string;
    const token = '';
    const streamNameBox = 'testMerge';

    const roomOfStream = ref<StringIndexedArray<string>>({});
    let noStream = false;
    let streamsList = ref<string[]>([]);

    /* function toggleResolution(event) {
		merger.changeStreamSize(sb.value);
	} */
    /* function toggleRatio() {
		if (narrow.checked == true) {
			merger.changeAspectRatio("4:3");
		}
		else {
			merger.changeAspectRatio("16:9");
		}

	} */

    function mergeStreams() {
      let delayInMilliseconds = 1500;

      setTimeout(function () {
        merger.start();
        let result = merger.getResult() as MediaStream;
        webRTCAdaptorMerged.value.gotStream?.(result);
        //console.log('streamslist = ' + streamsList.value);
        if (streamsList.value.length > 0) {
          publish(streamNameBox, '');
          noStream = false;
        } else {
          alert('There is no stream available in the room');
          noStream = true;
        }
      }, delayInMilliseconds);
    }

    function joinRoom() {
      webRTCAdaptorMerged.value.joinRoom?.(
        roomNameBox,
        streamNameBox,
        'legacy'
      );
    }

    /* function leaveRoom() {
		webRTCAdaptorMerged.value.leaveFromRoom?.(roomNameBox.value);
		merger.stop();
	} */

    function publish(streamName: string, token: string) {
      //streamName = streamNameBox.value;
      //publishStreamId = streamName;
      webRTCAdaptorMerged.value.publish?.(streamName, token);
    }

    function streamInformation(obj: objWebRTC) {
      webRTCAdaptorMerged.value.play?.(obj.streamId, token, roomNameBox);
    }

    const handleMerge = () => {
      //const roomId = 'room5';

      const merger = new StreamMerger(320, 240, true, '4:3');
      merger.start();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      //const result = merger.getResult();

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

      const mediaConstraints = {
        video: false,
        audio: false,
      };
      let oldId: unknown = null;
      /* let appName = location.pathname.substring(0, location.pathname
		.lastIndexOf("/") + 1); */
      //var path = location.hostname + ":" + location.port + appName + "websocket";
      let websocketURL = 'wss://dialguiba.tech/WebRTCAppEE/websocket';
      /* let websocketURL = "ws://" + path; */

      /* if (location.protocol.startsWith("https")) {
		websocketURL = "wss://" + path;
	} */
      var xindex = 0;
      var yindex = 0;

      webRTCAdaptorMerged.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        localVideoId: 'localVideoMerged',
        isPlayMode: true,
        debug: false,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            console.log('initialized');
          } else if (info == 'joinedTheRoom') {
            mergeStreams();
            let room = obj.ATTR_ROOM_NAME;
            roomOfStream.value[obj.streamId] = room;

            console.log('joined the room: ' + room);
            console.log(obj);
            //publishStreamId = obj.streamId;

            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                console.log('Stream joined with ID: ' + item);
                webRTCAdaptorMerged.value.play?.(item, token, roomNameBox);
              });
              streamsList.value = obj.streams;
            }
            roomTimerId.value = setInterval(() => {
              webRTCAdaptorMerged.value.getRoomInfo?.(
                roomNameBox,
                streamNameBox
              );
            }, 5000);
          } else if (info == 'newStreamAvailable') {
            if (noStream) {
              mergeStreams();
            }
            noStream = false;
            if (oldId != obj.streamId) {
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
              console.debug('adding stream id = ' + obj.streamId);
            }
            oldId = obj.streamId;
          } else if (info == 'publish_started') {
            //stream is being published
            /* console.debug(
              'publish started to room: ' + roomOfStream[obj.streamId]
            ); */
            //startAnimation();
          } else if (info == 'publish_finished') {
            //stream is being finished
            console.debug('publish finished');

            if (streamsList.value != null) {
              streamsList.value.forEach(function (item) {
                console.log(item);
                /* removeRemoteVideo(item); */
              });
            }
            // we need to reset streams list
            streamsList.value = new Array<string>();
          } else if (info == 'screen_share_stopped') {
            console.log('screen share stopped');
          } else if (info == 'leavedFromRoom') {
            var room = obj.ATTR_ROOM_NAME;
            console.debug('leaved from the room:' + room);
            if (roomTimerId.value != null) {
              clearInterval(roomTimerId.value);
            }
          } else if (info == 'closed') {
            //console.log("Connection closed");
            if (typeof obj != 'undefined') {
              console.log('Connecton closed: ' + JSON.stringify(obj));
            }
          } else if (info == 'play_finished') {
            console.log('play_finished');
            /* var video = document.getElementById('remoteVideo' + obj.streamId) as video;
            if (video != null) {
              video.srcObject = null;
            } */
            merger.removeStream(obj.streamId);
          } else if (info == 'streamInformation') {
            streamInformation(obj);
          } else if (info == 'roomInformation') {
            var tempRoomStreamList = [];
            // Check stream is in room
            // PS: Old room list mean streams doesn't have own stream ID
            if (streamsList.value != null) {
              for (var i = 0; i < streamsList.value.length; i++) {
                let oldStreamListItem = streamsList.value[i];

                //let oldRoomItemIndex = streamsList.value.indexOf(oldStreamListItem);
                let newRoomItemIndex = obj.streams.indexOf(oldStreamListItem);

                // If streams item is in obj.streams, it's
                if (obj.streams.includes(oldStreamListItem)) {
                  if (newRoomItemIndex > -1) {
                    obj.streams.splice(newRoomItemIndex, 1);
                  }
                  tempRoomStreamList.push(oldStreamListItem);
                } else {
                  /* removeRemoteVideo(oldStreamListItem); */
                }
              }
            }

            //Play new streams in list
            if (obj.streams != null) {
              obj.streams.forEach(function (item) {
                tempRoomStreamList.push(item);
                console.log('Stream joined with ID: ' + item);
                webRTCAdaptorMerged.value.play?.(item, token, roomNameBox);
              });
            }
            streamsList.value = tempRoomStreamList;
          } else if (info == 'data_received') {
            //handleNotificationEvent(obj);
          }
        },
        callbackError: function (error: string, message: string) {
          //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
          console.log(message);
          if (
            error.indexOf('publishTimeoutError') != -1 &&
            roomTimerId.value != null
          ) {
            clearInterval(roomTimerId.value);
          }

          console.log('error callback: ' + JSON.stringify(error));
          var errorMessage = JSON.stringify(error);
          /* if (typeof message != 'undefined') {
            errorMessage = message;
          }
          var errorMessage = JSON.stringify(error);
          if (error.indexOf('TypeError') != -1) {
            errorMessage = 'Video/Audio is required.';
          } else if (error.indexOf('UnsecureContext') != -1) {
            errorMessage =
              'Fatal Error: Browser cannot access camera and mic because of unsecure context. Please install SSL and access via https';
          } else if (error.indexOf('WebSocketNotSupported') != -1) {
            errorMessage =
              'Fatal Error: WebSocket not supported in this browser';
          } else if (error.indexOf('no_stream_exist') != -1) {
            //TODO: removeRemoteVideo(error.streamId);
          } */
          //alert(errorMessage);
          console.log(errorMessage);
        },
      }) as WebRTCAdaptorType;

      /* joinRoom(); */
    };

    onMounted(() => {
      /* handleMerge(); */
      const cookieEndpoint = getCookie('endpoint');
      const cookieKey = getCookie('key');

      if (cookieEndpoint && cookieKey) {
        isStreaming.value = true;
        endpoint.value = cookieEndpoint;
        key.value = cookieKey;
      }
    });

    function setCookie(name: string, value: string, days: number) {
      var expires = '';
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }
    function getCookie(name: string) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
    function eraseCookie(name: string) {
      document.cookie =
        name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    const handleStartTransmission = async () => {
      let rtmpUrl = `${endpoint.value}/${key.value}`;
      if (rtmpUrl.slice(-1) === '/') {
        rtmpUrl.slice(0, -1);
      }
      const rtmpRequest = new Request(
        `https://dialguiba.tech/WebRTCAppEE/rest/v2/broadcasts/${userMe.id}/rtmp-endpoint`,
        {
          method: 'POST',
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rtmpUrl,
          }),
        }
      );
      const response = await fetch(rtmpRequest);
      console.log(response);
      if (response.ok) {
        //document.cookie = 'isInTransmission=true';
        setCookie('endpoint', endpoint.value, 30);
        setCookie('key', key.value, 30);
        isStreaming.value = true;
      }
    };

    const handleEndTransmission = async () => {
      let rtmpUrl = `${endpoint.value}/${key.value}`;
      if (rtmpUrl.slice(-1) === '/') {
        rtmpUrl.slice(0, -1);
      }
      const rtmpRequest = new Request(
        `https://dialguiba.tech/WebRTCAppEE/rest/v2/broadcasts/${userMe.id}/rtmp-endpoint`,
        {
          method: 'DELETE',
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rtmpUrl,
          }),
        }
      );
      const response = await fetch(rtmpRequest);
      console.log(response);
      if (response.ok) {
        //document.cookie = 'isInTransmission=true';
        eraseCookie('endpoint');
        eraseCookie('key');
        isStreaming.value = false;
      }
    };

    return {
      handleStartTransmission,
      handleEndTransmission,
      endpoint,
      key,
      openModal,
      layout,
      moreContent,
      contentSize: computed(() => (moreContent.value ? 150 : 5)),
      drawer: ref(false),
      drawerR: ref(false),
      lorem:
        'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus, ratione eum minus fuga, quasi dicta facilis corporis magnam, suscipit at quo nostrum!',
      isStreaming,
    };
  },
});
</script>

<style lang="sass">
@import 'modal'
</style>
