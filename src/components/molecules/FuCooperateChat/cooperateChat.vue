<template>
  <section class="m-chat">
    <header class="m-chat__title">
      <label class="m-chat__title__text">
        <q-icon name="wechat" color="white" size="35px" />
        Chat público
      </label>
    </header>
    <section class="m-chat__body">
      <main class="m-chat__messagesBox">
        MENSAJES SE VERÁN AQUÍ
        {{ userMessage.message }}
      </main>
      <div class="m-chat__formBox">
        <form
          class="m-chat__formBox__form"
          autocomplete="off"
          @submit.prevent="sendMessge"
        >
          <q-input
            class="m-chat__formBox__form__input"
            autofocus
            dense
            v-model="userInput"
            color="grey"
            :input-style="{ color: '#fffffe' }"
            outlined
            rounded
            placeholder="Nuevo mensaje..."
          />
          <q-btn
            class="m-chat__formBox__form__saveBtn"
            icon="send"
            round
            type="submit"
            color="indigo-8"
            :disable="!userInput"
            @click="sendMessage"
          />
        </form>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { regexp } from '@/types';
import { warningMessage } from '@/utils/notify';
import { useHandleMessage } from '@/componsables/chat';
import { useRoute } from 'vue-router';
import { WebRTCAdaptorType } from '@/types';

// import { useInitWebRTC } from '@/componsables/ant-media-server-stuff';
// interface Prueba {
//   streamId: string
//   streamName: string
//   eventType: string;
//   userMessage: string
// }
export default defineComponent({
  name: 'FuCooperateChat',
  props: {
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  setup(props) {
    const route = useRoute();
    let userInput = ref<string>('');
    let { userMessage } = useHandleMessage();
    const sendMessage = () => {
      if (!regexp.test(userInput.value)) {
        warningMessage('Complete los campos');
        return;
      }
      const mole = {
        streamId: route.query.streamId as string,
        streamName: route.query.streamName as string,
        eventType: 'CHAT_MESSAGE',
        message: userInput.value,
      };

      console.log(userInput.value, mole);
      props.webRTCAdaptor?.sendData?.(
        route.query.streamId as string,
        JSON.stringify(mole)
      );
    };
    return {
      userInput,
      sendMessage,
      userMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateChat.scss';
</style>
