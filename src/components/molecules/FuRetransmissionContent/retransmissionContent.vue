<template>
  <q-card class="m-transmission">
    <q-card-section tag="header" class="m-transmission__header">
      <!-- <q-btn flat @click="drawerR = !drawerR" round dense icon="menu" /> -->
      <label class="m-transmission__header__text"
        >Retransmitir en Redes sociales</label
      >
      <q-btn flat v-close-popup round dense icon="close" color="white" />
    </q-card-section>
    <q-card-section class="m-transmission__body">
      <q-input
        outlined
        color="grey-4"
        label-color="grey-1"
        :input-style="{ color: '#fffffe' }"
        v-model="endpoint"
        label="Endpoint (rtmps://live-api-s.facebook.com:443/rtmp)"
      />
      <q-input
        outlined
        color="grey-4"
        label-color="grey-1"
        :input-style="{ color: '#fffffe' }"
        v-model="key"
        label="Key (FB-12341432344535255-3234-323)"
      />
      <q-btn
        push
        class="m-transmission__body__btn"
        :ripple="false"
        :color="!isStreaming ? 'primary' : 'negative'"
        :label="!isStreaming ? 'Transmitir' : 'Detener transmisión'"
        v-on="
          !isStreaming
            ? { click: handleStartTransmission }
            : { click: handleEndTransmission }
        "
      />

      <fu-hidden-text />
    </q-card-section>
  </q-card>
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
import FuHiddenText from '@/components/atoms/FuHiddenText';

interface StringIndexedArray<TValue> {
  [id: string]: TValue;
}

export default defineComponent({
  name: 'FuRetransmissionContent',
  components: {
    FuHiddenText,
  },
  setup() {
    const { userMe } = useUserMe();
    const moreContent = ref(true);
    // const layout = ref(false);
    const webRTCAdaptorMerged = ref<WebRTCAdaptorType>({});

    const endpoint = ref('');
    const key = ref('');

    const isStreaming = ref(false);

    // const openModal = () => {
    //   layout.value = true;
    // };
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
      // openModal,
      // layout,
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

<style lang="scss" scoped>
@import './retransmissionContent.scss';
</style>
