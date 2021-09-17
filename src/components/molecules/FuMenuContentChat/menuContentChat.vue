<template>
  <section class="a-menu">
    <ul class="a-menu__chatList">
      <li
        class="a-menu__chatList__item"
        v-for="option in chatOptions"
        :key="option.id"
        @click="executeChatMenuOption(option.interaction)"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__chatList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { chatMenuIcon, Options } from '@/helpers/menuOptions';
import { useHandleMessage } from '@/composables/chat';

interface ChatMenu {
  CLEARCHAT(): () => void;
}
export default defineComponent({
  name: 'FuMenuContentChat',
  setup() {
    const chatOptions = ref<Options[]>(chatMenuIcon);
    const { deleteMessages } = useHandleMessage();
    const chatMenuObject = reactive({
      CLEARCHAT: () => deleteConversation(),
    });
    const deleteConversation = () => {
      deleteMessages();
    };
    const executeChatMenuOption = (interaction: string) => {
      chatMenuObject[interaction as keyof ChatMenu]();
    };
    return {
      chatOptions,
      executeChatMenuOption,
    };
  },
});
</script>

<style scoped lang="scss">
@import './menuContentChat.scss';
</style>
