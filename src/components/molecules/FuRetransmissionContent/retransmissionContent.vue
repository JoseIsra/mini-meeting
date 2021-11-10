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
          v-model="inputValueEndPointRTMP"
          :readonly="streamService == 'rtmp'"
          placeholder="Endpoint (rtmps://live-api-s.facebook.com:443/rtmp)"
        />
        <label class="m-transmission__body__inputFields__label">KEY</label>
        <input
          class="m-transmission__body__inputFields__input"
          v-model="inputValueKeyRTMP"
          :readonly="streamService == 'rtmp'"
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
import { useRoom, useUserMe } from '@/composables';
import { IStreamServiceObject, SocialMedia, objWebRTC } from '@/types';
import { useRoute } from 'vue-router';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';

export default defineComponent({
  name: 'FuRetransmissionContent',
  props: {
    streamService: {
      type: String,
    },
  },
  setup(props) {
    const route = useRoute();
    const { userMe } = useUserMe();
    const { roomState, updateRoom } = useRoom();
    const endpoint = ref('');
    const key = ref('');
    const streamId = `r-nr-${roomState.classroomId}-${userMe.id}-${roomState.id}`;
    const streamName = `OBS-${userMe.name}`;
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

    const server = ref<string>(process.env.ANTMEDIA_SERVER);
    const app = ref<string>(process.env.ANTMEDIA_APP);

    const roomId =
      window?.xprops?.roomId || (route.query.roomId as string) || '';
    const publishToken =
      window?.xprops?.publishToken ||
      (route.query.publishToken as string) ||
      '';

    const subscriberId = (route.query.subscriberId as string) || undefined;

    const subscriberCode = (route.query.subscriberCode as string) || undefined;
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
    const webRTCInstance = ref<WebRTCAdaptor>({} as WebRTCAdaptor);

    const sdpConstraints = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false,
    };

    onMounted(() => {
      /* handleMerge(); */
      const cookieEndpoint = getCookie('endpoint');
      const cookieKey = getCookie('key');

      if (cookieEndpoint && cookieKey) {
        // solo haciendo pruebas con el rmtp
        roomState.rtmpTransmission = true;
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

    const inputValueEndPointRTMP = computed(() => {
      return props.streamService == 'rtmp'
        ? `rtmp://${server.value}/${app.value}`
        : '';
    });

    const inputValueKeyRTMP = computed(() => {
      return props.streamService == 'rtmp' ? streamId : '';
    });

    //***************COOL FUNCTIONS  */
    // > general controller for all types of tranmissions
    const leaveRoom = (roomId: string) => {
      webRTCInstance.value.leaveFromRoom?.(roomId);
    };

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

    const initRTMPTransmission = async () => {
      console.log('INICIANDO RTMP 📽️');
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

      initMiniWebrtc(streamId, streamName, roomId);
      if (response.ok) {
        updateRoom({ rtmpTransmission: true });
        console.log('transmision rtmp i guess 🤔');
        //document.cookie = 'isInTransmission=true';
        setCookie('endpoint', endpoint.value, 30);
        setCookie('key', key.value, 30);
      }
    };
    const stopPublishing = (streamId: string) => {
      webRTCInstance.value.stop(streamId);
    };

    const endRTMPTransmission = async () => {
      console.log('TERMINANDO RTMP 📽️');
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
        console.log('finalizando rmtp tranmission 🤔');
        //document.cookie = 'isInTransmission=true';
        eraseCookie('endpoint');
        eraseCookie('key');
        updateRoom({ rtmpTransmission: false });

        stopPublishing('retraId');
        webRTCInstance.value.leaveFromRoom?.(roomId);
      }
    };

    const rtmp_transmission_controller = async () => {
      console.log('RTMP OBS GO 📽️');
      if (roomState.rtmpTransmission) {
        await endRTMPTransmission();
      } else {
        await initRTMPTransmission();
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
      streamId = streamId;
      webRTCInstance.value.publish?.(
        streamId,
        token,
        subscriberId,
        subscriberCode,
        streamName
      );
    };

    const userMeForObs = {
      id: streamId,
      avatar: 'https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg',
      name: streamName,
      isCameraOn: false,
      isMicOn: true,
      isScreenSharing: false,
      isVideoActivated: true,
      isMicBlocked: false,
      isCameraBlocked: false,
      isScreenShareBlocked: false,
      denied: 1,
      isRecording: false,
      fractalUserId: streamId,
      roleId: 1,
      isHost: false,
    };

    const initMiniWebrtc = (
      streamId: string,
      streamName: string,
      roomId: string
    ) => {
      webRTCInstance.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        isPlayMode: false,
        debug: true,
        dataChannelEnabled: true,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            joinRoom(roomId, streamId);
          } else if (info == 'joinedTheRoom') {
            console.log('JOINED THE ROOM MINIWEBRTC 🐊', obj);
            window.addEventListener('unload', () => {
              leaveRoom?.(roomId);
            });
            webRTCInstance.value.turnOffLocalCamera('retraId');
            publish(
              streamId,
              publishToken,
              subscriberId,
              subscriberCode,
              streamName
            );
            webRTCInstance.value.play?.(roomState.hostId, undefined, roomId);
          } else if (info == 'newStreamAvailable') {
            console.log('new stream available MINIWEBRTC 🚀', obj);
          } else if (info == 'publish_started') {
            console.log('PUBLICANDO MINI WEBRTC', obj);
          } else if (info == 'data_channel_opened') {
            const streamId = obj as unknown as string;
            console.log('dataChannelOpen with ⭐', streamId);
            if (streamId === roomState.hostId) {
              console.log('started retransmission channel ⭐');
              webRTCInstance.value.sendData?.(
                roomState.hostId,
                JSON.stringify({
                  eventType:
                    'NEW_USER:PARTICIPANTS_IN_ROOM_INFO_REQUEST_AND_SEND_OWN_INFO',
                  from: 'retraId',
                  to: roomState.hostId,
                  userInfo: userMeForObs,
                })
              );
            }
          }
        },
        callbackError: (error: string, message: string) => {
          console.log(error, message);
        },
      });
    };

    return {
      endpoint,
      key,
      serviceStreamHint,
      labelStreamingBtn,
      iconBtnStreaming,
      handleDifferentTransmissions,
      roomState,
      server,
      app,
      inputValueEndPointRTMP,
      inputValueKeyRTMP,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './retransmissionContent.scss';
</style>
