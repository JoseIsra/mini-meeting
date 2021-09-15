<template>
  <section class="m-chat">
    <header class="m-chat__title">
      <label class="m-chat__title__text">
        <q-icon name="wechat" color="white" size="30px" />
        Chat público
      </label>
    </header>
    <q-btn
      flat
      round
      icon="close"
      color="white"
      dense
      class="m-chat__leaveChat"
      @click="closeChat"
    />
    <section class="m-chat__body">
      <main class="m-chat__messagesBox" ref="messageContainer">
        <q-chat-message
          class="m-chat__messagesBox__bubble"
          v-for="message in userMessages"
          :key="message.id"
          :sent="message.streamId == userMe.id"
          :bg-color="
            message.streamId == userMe.id ? 'indigo-6' : 'deep-purple-9'
          "
          :size="
            message.typeMessage == 'plainText'
              ? bubbleSize(message.message)
              : '9'
          "
          text-color="white"
        >
          <template #avatar>
            <div class="m-chat__messagesBox__info">
              <q-img
                class="m-chat__messagesBox__info__avatar"
                name="fractalup-logo"
                :src="message.avatar"
                style="width: 30px"
              ></q-img>
              <aside
                :class="[
                  message.streamId === userMe.id
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
            <span
              class="m-chat__messagesBox__message__text"
              v-if="message.typeMessage == 'plainText'"
              >{{ message.message }}</span
            >
            <span v-if="message.typeMessage == 'image'">
              <!-- {{ blobToUrl(message.message) }} -->
              <q-img
                spinner-color="white"
                :src="message.message"
                alt="file-logo"
              />
            </span>
          </div>
        </q-chat-message>
      </main>
      <div class="m-chat__formBox">
        <form
          class="m-chat__formBox__form"
          autocomplete="off"
          @submit.prevent="sendMessage"
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
          <input
            type="file"
            :style="{ display: 'none' }"
            @change="fileSelected"
            ref="fileInput"
          />
          <q-btn
            flat
            round
            icon="attach_file"
            dense
            @click="$refs.fileInput.click()"
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
import {
  defineComponent,
  ref,
  PropType,
  VueElement,
  nextTick,
  onUpdated,
} from 'vue';
import { regexp } from '@/types';
import { warningMessage } from '@/utils/notify';
import { useRoute } from 'vue-router';
import { WebRTCAdaptorType } from '@/types';
import moment from 'moment';
import { useHandleMessage } from '@/composables/chat';
import { useUserMe } from '@/composables/userMe';
import { nanoid } from 'nanoid';
import { useSidebarToogle, useToogleFunctions } from '@/composables';
import { ZoidWindow } from '@/types/zoid';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
type MessageContainer = VueElement & {
  scrollTop: number;
  scrollHeight: number;
};
interface ObjectBlob {
  blob: string;
}

export default defineComponent({
  name: 'FuCooperateChat',
  props: {
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  setup(props) {
    const route = useRoute();
    const messageContainer = ref<MessageContainer>({} as MessageContainer);
    let userInput = ref<string>('');
    const { userMessages, setUserMessage } = useHandleMessage();
    let { setSidebarState } = useSidebarToogle();
    const { setIDButtonSelected } = useToogleFunctions();
    const { userMe } = useUserMe();
    let userName = ref(
      (window as ZoidWindow)?.xprops?.streamId || route.query.streamName
    );

    const sendMessage = async () => {
      if (!regexp.test(userInput.value)) {
        warningMessage('Complete los campos');
        return;
      }
      await addMessage(userInput.value, new Date(), 'plainText');
    };

    const blobToBase64 = (blob: Blob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          resolve(reader.result);
        };
      });
    };

    const some = async (blob: Blob): Promise<string> => {
      const bse64 = await blobToBase64(blob);
      return JSON.stringify({ blob: bse64 });
    };

    const addMessage = async (
      blobMessage: string | Blob,
      thedate: Date,
      typeMessage: string
    ) => {
      const urlCreator = window.URL || window.webkitURL;
      const content = urlCreator.createObjectURL(blobMessage);

      let userLocalMessage = {
        id: nanoid(),
        streamId: userMe.id,
        date: moment(thedate).format('h: mm a'),
        streamName: userMe.name,
        eventType: 'CHAT_MESSAGE',
        message: content,
        avatar: userMe.avatar,
        typeMessage,
      };

      setUserMessage(userLocalMessage);

      let userMessage = {
        id: nanoid(),
        streamId: userMe.id,
        date: moment(thedate).format('h: mm a'),
        streamName: userMe.name,
        eventType: 'CHAT_MESSAGE',
        message: await some(blobMessage as Blob),
        avatar: userMe.avatar,
        typeMessage,
      };

      //console.log('user', JSON.stringify(userMessage));
      props.webRTCAdaptor?.sendData?.(
        (window as ZoidWindow)?.xprops?.streamId ||
          (route.query.streamId as string),
        JSON.stringify(userMessage)
      );
      userInput.value = '';
    };

    const fileSelected = (e: HTMLInputEvent) => {
      let imageURL = e?.target?.files?.[0] as File;
      const reader = new FileReader();
      const [leftType, rightType] = imageURL.type.split('/');
      console.log(leftType, rightType);
      reader.onload = async function (e: ProgressEvent<FileReader>) {
        const arrayBuffer = e?.target?.result;
        const bytes = new Uint8Array(arrayBuffer as ArrayBuffer);
        const blob = new Blob([bytes.buffer], { type: imageURL.type });

        //cargar imagen supongo aquí
        //enviar la info
        //console.log(imageBlobUrl);

        if (leftType === 'image') {
          await addMessage(blob, new Date(), 'image');
        } else {
          await addMessage(blob, new Date(), 'file');
        }
        // if (leftType == 'image') {
        // } else {
        //   addMessage(imageBlobUrl, new Date(), 'file');
        // }
      };
      reader.readAsArrayBuffer(imageURL);
    };
    const bubbleSize = (message: string) => {
      let numOfWords = message.split(' ').length;
      if (message.startsWith('https')) {
        return '9';
      }
      if (numOfWords <= 1) {
        return '3';
      }
      return '';
    };
    const closeChat = () => {
      setSidebarState(false);
      setIDButtonSelected('');
    };

    const blobToUrl = async (message: string) => {
      const parsed = JSON.parse(message) as ObjectBlob;
      const bloby = await fetch(parsed.blob).then((res) => res.blob());
      const urlCreator = window.URL || window.webkitURL;
      console.log('RUTA', urlCreator.createObjectURL(bloby));
      return urlCreator.createObjectURL(bloby);
    };

    const scrollToEnd = () => {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    };
    onUpdated(async () => {
      try {
        await nextTick(() => scrollToEnd());
      } catch (error) {
        console.error(error);
      }
    });

    return {
      userInput,
      sendMessage,
      userMessages,
      userName,
      bubbleSize,
      userMe,
      closeChat,
      fileSelected,
      messageContainer,
      blobToUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateChat.scss';
</style>
