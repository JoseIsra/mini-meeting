<template>
  <section class="a-full">
    <div v-show="!userMe.isVideoActivated" class="a-full__avatar">
      <figure class="a-full__avatar__imageBox">
        <img class="a-full__avatar__imageBox__image" :src="userMe.avatar" />
      </figure>
      <div class="a-full__avatar__info">
        <label class="a-full__avatar__info__userName">{{ userMe.name }}</label>
        <q-icon
          :name="userMe.isMicOn ? 'mic' : 'mic_off'"
          size="20px"
          color="white"
        />
      </div>
    </div>
    <video
      v-show="userMe.isVideoActivated && isFullScreen && test"
      class="a-full__stream"
      autoplay
      muted
      playsinline
      :srcObject.prop="test"
    ></video>
    <div class="a-full__actions">
      <q-btn
        @click="exitFullScreen"
        round
        flat
        icon="fullscreen_exit"
        color="white"
      />
      <label class="a-full__actions__message">Salir de pantalla completa</label>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useToogleFunctions } from '@/composables';
import { useUserMe } from '@/composables/userMe';
import { useInitWebRTC } from '@/composables/antMedia';

export default defineComponent({
  name: 'FuFullScreen',
  setup() {
    const { userMe, pinnedUserStream } = useUserMe();
    const { isFullScreen, setFullScreen } = useToogleFunctions();
    /* const { metodoDePrueba } = useInitWebRTC(); */
    const test = ref({} as MediaStream);

    const exitFullScreen = () => {
      console.log(test);
      setFullScreen(false);
    };
    onMounted(() => {
      //test.value = props.webRTCAdaptor?.metodoDePrueba?.() as MediaStream;
      /* test.value = metodoDePrueba(); */
      // setPinnedUser(test.value);
      // setTimeout(() => {
      // }, 2000);
    });
    return {
      userMe,
      exitFullScreen,
      isFullScreen,
      test,
      pinnedUserStream,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fullScreen.scss';
</style>
