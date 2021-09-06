<template>
  <section class="m-chat">
    <header class="m-chat__title">
      <label class="m-chat__title__text">
        <q-icon name="wechat" color="white" size="30px" />
        Chat público
      </label>
    </header>
    <section class="m-chat__body">
      <main class="m-chat__messagesBox" ref="messageContainer">
        <q-chat-message
          class="m-chat__messagesBox__bubble"
          v-for="message in userMessages"
          :key="message.id"
          :sent="message.streamName == userName"
          :bg-color="
            message.streamName == userName ? 'indigo-6' : 'deep-purple-9'
          "
          text-color="white"
          :size="bubbleSize(message.message)"
        >
          <template #avatar>
            <div class="m-chat__messagesBox__info">
              <q-img
                class="m-chat__messagesBox__info__avatar"
                name="fractalup-logo"
                src="https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg"
                style="width: 30px"
              ></q-img>
              <aside
                :class="[
                  message.streamName === userName
                    ? 'm-chat__messagesBox__info__user'
                    : 'm-chat__messagesBox__info__secondUser',
                ]"
              >
                <span class="m-chat__messagesBox__info__stamp">{{
                  message.date
                }}</span>
                <span class="m-chat__messagesBox__info__name">
                  {{ message.streamName }}</span
                >
              </aside>
            </div>
          </template>
          <div class="m-chat__messagesBox__message">
            <span class="m-chat__messagesBox__message__text">{{
              message.message
            }}</span>
          </div>
        </q-chat-message>
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
import { useRoute } from 'vue-router';
import { WebRTCAdaptorType } from '@/types';
import moment from 'moment';
import { useHandleMessage } from '@/composables/chat';
import { nanoid } from 'nanoid';

// import { useInitWebRTC } from '@/composables/ant-media-server-stuff';

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
    let { userMessages, setUserMessage } = useHandleMessage();
    let userName = ref(route.query.streamName);

    const sendMessage = () => {
      if (!regexp.test(userInput.value)) {
        warningMessage('Complete los campos');
        return;
      }
      const userMessage = {
        id: nanoid(),
        streamId: route.query.streamId as string,
        date: moment(new Date()).format('h: mm a'),
        streamName: route.query.streamName as string,
        eventType: 'CHAT_MESSAGE',
        message: userInput.value,
      };
      setUserMessage(userMessage);

      props.webRTCAdaptor?.sendData?.(
        route.query.streamId as string,
        JSON.stringify(userMessage)
      );
      userInput.value = '';
    };

    const bubbleSize = (message: string) => {
      let numOfWords = message.split(' ').length;
      if (numOfWords <= 1) {
        return '3';
      }
      return '';
    };

    return {
      userInput,
      sendMessage,
      userMessages,
      userName,
      bubbleSize,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateChat.scss';
</style>
