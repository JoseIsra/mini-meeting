<template>
  <section class="m-chat">
    <header class="m-chat__title">
      <label class="m-chat__title__text">
        <q-icon name="wechat" color="white" size="35px" />
        Chat público
      </label>
    </header>
    <section class="m-chat__body">
      <main class="m-chat__messagesBox">MENSAJES SE VERÁN AQUÍ</main>
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
            v-model="userMessage"
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
            :disable="!userMessage"
            @click="sendMessage"
          />
        </form>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { regexp } from '@/types';
import { warningMessage } from '@/utils/notify';

export default defineComponent({
  setup() {
    let userMessage = ref<string>('');
    const sendMessage = () => {
      if (!regexp.test(userMessage.value)) {
        warningMessage('Complete los campos');
        return;
      }
      console.log(userMessage.value);
    };
    return {
      userMessage,
      sendMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateChat.scss';
</style>
