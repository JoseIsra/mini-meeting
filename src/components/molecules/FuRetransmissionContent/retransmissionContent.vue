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
import { useUserMe } from '@/composables/userMe';
import FuHiddenText from '@/components/atoms/FuHiddenText';

export default defineComponent({
  name: 'FuRetransmissionContent',
  components: {
    FuHiddenText,
  },
  setup() {
    const { userMe } = useUserMe();
    const moreContent = ref(true);
    // const layout = ref(false);

    const endpoint = ref('');
    const key = ref('');

    const isStreaming = ref(false);

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
