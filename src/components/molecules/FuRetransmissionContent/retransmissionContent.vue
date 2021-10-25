<template>
  <q-card class="m-transmission">
    <q-card-section tag="header" class="m-transmission__header">
      <p class="m-transmission__header --mainText">
        Transmisión vía {{ streamService }}
      </p>
      <label class="m-transmission__header --hint"
        ><small>
          {{ serviceStreamHint }}
        </small></label
      >
    </q-card-section>
    <q-card-section class="m-transmission__body">
      <div class="m-transmission__body__inputFields">
        <label class="m-transmission__body__inputFields__label">Endpoint</label>
        <input
          class="m-transmission__body__inputFields__input"
          v-model="endpoint"
          placeholder="Endpoint (rtmps://live-api-s.facebook.com:443/rtmp)"
        />
        <label class="m-transmission__body__inputFields__label">KEY</label>
        <input
          class="m-transmission__body__inputFields__input"
          v-model="key"
          placeholder="Key (FB-12341432344535255-3234-323)"
        />
      </div>
      <q-btn
        push
        :class="[
          'm-transmission__body__btn',
          { '--facebook': streamService == 'facebook' },
          { '--youtube': streamService == 'youtube' },
          { '--rtmp': streamService == 'rtmp' },
          {
            '--stopFacebook':
              streamService == 'facebook' && roomState.fbTransmission,
          },
          {
            '--stopYoutube':
              streamService == 'youtube' && roomState.ytTransmission,
          },
          {
            '--stopRTMP': streamService == 'rtmp' && roomState.rtmpTransmission,
          },
        ]"
        :label="labelStreamingBtn"
        :icon="iconBtnStreaming"
        @click="handleDifferentTransmissions"
      />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { defineComponent, ref, computed, onMounted, reactive } from 'vue';
import { useUserMe } from '@/composables/userMe';
import { useRoom } from '@/composables/room';
import { IStreamServiceObject, SocialMedia } from '@/types';
export default defineComponent({
  name: 'FuRetransmissionContent',
  props: {
    streamService: {
      type: String,
    },
  },
  setup(props) {
    const { userMe } = useUserMe();
    const moreContent = ref(true);
    // const layout = ref(false);
    const { roomState, updateRoom } = useRoom();
    const endpoint = ref('');
    const key = ref('');

    const isStreaming = ref(false);
    const fbStreaming = ref(false);
    const ytStreaming = ref(false);
    const rtmpStreaming = ref(false);
    const streamServiceObject = reactive<IStreamServiceObject>({
      facebook: 'Agrega las credenciales dadas por Facebook',
      youtube: 'Agrega las credenciales dadas por Youtube',
      rtmp: 'Copia y pega las credenciales en OBS',
      labelBtn: {
        facebook: 'Iniciar transmisión en Facebook',
        youtube: 'Iniciar transmisión en Youtube',
        rtmp: 'Iniciar transmisión por RTMP',
      },
      iconBtn: {
        facebook: 'fab fa-facebook-square',
        youtube: 'fab fa-youtube',
        rtmp: 'fas fa-broadcast-tower',
      },
      stopStreamingIconBtn: {
        facebook: 'stop_circle',
        youtube: 'stop_circle',
        rtmp: 'stop_circle',
      },
      closeTransmissionLabelBtn: {
        facebook: 'Detener transmisión en Facebook',
        youtube: 'Detener transmisión en Youtube',
        rtmp: 'Detener transmisión en RTMP',
      },
      transmissionMethods: {
        facebook: () => facebook_transmission_controller(),
        youtube: () => youtube_transmission_controller(),
        rtmp: () => rtmp_transmission_controller(),
      },
    });

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

    //*****************COMPUTED COOLS THINGS */

    const serviceStreamHint = computed(() => {
      return streamServiceObject[
        props.streamService as keyof IStreamServiceObject
      ];
    });

    const labelStreamingBtn = computed(() => {
      return !roomState.fbTransmission && props.streamService == 'facebook' //si no en fb
        ? streamServiceObject.labelBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : !roomState.ytTransmission && props.streamService == 'youtube'
        ? streamServiceObject.labelBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : !roomState.rtmpTransmission && props.streamService == 'rtmp'
        ? streamServiceObject.labelBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : streamServiceObject.closeTransmissionLabelBtn?.[
            props.streamService as keyof SocialMedia
          ];
    });

    const iconBtnStreaming = computed(() => {
      return !roomState.fbTransmission && props.streamService == 'facebook' //si no en fb
        ? streamServiceObject.iconBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : !roomState.ytTransmission && props.streamService == 'youtube'
        ? streamServiceObject.iconBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : !roomState.rtmpTransmission && props.streamService == 'rtmp'
        ? streamServiceObject.iconBtn?.[
            props.streamService as keyof SocialMedia
          ]
        : streamServiceObject.stopStreamingIconBtn?.[
            props.streamService as keyof SocialMedia
          ];
    });

    //***************COOL FUNCTIONS  */
    // > general controller for all types of tranmissions
    const handleDifferentTransmissions = () => {
      streamServiceObject?.transmissionMethods?.[
        props.streamService as keyof SocialMedia
      ]();
    };

    const initFbTransmission = () => {
      updateRoom({ fbTransmission: true });
      console.log('go faceboook');
    };
    const endFbTransmission = () => {
      console.log('terminando de fb');
      updateRoom({ fbTransmission: false });
    };

    const facebook_transmission_controller = () => {
      if (roomState.fbTransmission) {
        endFbTransmission();
      } else {
        initFbTransmission();
      }
    };

    const initYouTubeTransmission = () => {
      updateRoom({ ytTransmission: true });
      console.log('Iniciando en youtube');
    };
    const endYouTubeTransmission = () => {
      console.log('terminando en youtube...');
      updateRoom({ ytTransmission: false });
    };
    const youtube_transmission_controller = () => {
      console.log('youtube');
      if (roomState.ytTransmission) {
        endYouTubeTransmission();
      } else {
        initYouTubeTransmission();
      }
    };

    const initRTMPTransmission = () => {
      console.log('INICIANDO RTMP 📽️');
      updateRoom({ rtmpTransmission: true });
    };

    const endRTMPTransmission = () => {
      console.log('TERMINANDO RTMP 📽️');
      updateRoom({ rtmpTransmission: false });
    };

    const rtmp_transmission_controller = () => {
      console.log('RTMP OBS GO 📽️');
      if (roomState.rtmpTransmission) {
        endRTMPTransmission();
      } else {
        initRTMPTransmission();
      }
    };

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
        `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/${userMe.id}/rtmp-endpoint`,
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
        `https://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/rest/v2/broadcasts/${userMe.id}/rtmp-endpoint`,
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
      serviceStreamHint,
      labelStreamingBtn,
      iconBtnStreaming,
      fbStreaming,
      ytStreaming,
      rtmpStreaming,
      handleDifferentTransmissions,
      roomState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './retransmissionContent.scss';
</style>
