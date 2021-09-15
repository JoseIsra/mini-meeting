<template>
  <section class="a-menu">
    <ul class="a-menu__optionList">
      <li
        class="a-menu__optionList__item"
        v-for="option in options.firstSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        class="a-menu__optionList__item"
        v-for="option in options.secondSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        class="a-menu__optionList__item"
        v-for="option in options.thirdSection"
        :key="option.id"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        v-for="option in options.fourthSection"
        :class="[
          'a-menu__optionList__item',
          { '--important': option.important },
        ]"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="18px" color="white" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';
import { ZoidWindow } from '@/types/zoid';
import { useUserMe } from '@/composables/userMe';
import { useRoom } from '@/composables/room';
import { useInitWebRTC } from '@/composables/antMedia';

export default defineComponent({
  name: 'FuMenuContentOptions',
  setup() {
    const { userMe } = useUserMe();
    const { roomState } = useRoom();
    const { sendData } = useInitWebRTC();

    const options = ref<MenuOptions>(menuOptions);

    const deleteRoom = async (roomId: string) => {
      const request = new Request(
        `https://dialguiba.tech/WebRTCAppEE/rest/v2/broadcasts/conference-rooms/${roomId}`,
        {
          headers: {
            Authorization:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.dnwd9sjQmEAyWWpbaGWA9R6pW4Qxu5eYES9Xrpl5UsY',
          },
          method: 'DELETE',
        }
      );
      const res = await fetch(request);

      return {
        status: res.status,
        body: (await res.json()) as Record<string, string>,
      };
    };

    const handleOptionSelected = (interaction?: string) => {
      if (interaction === 'LEAVE') {
        console.log('leave');
        (window as ZoidWindow).xprops?.handleLeaveCall?.();
      } else if (interaction === 'END') {
        console.log('end');
        deleteRoom(roomState.id)
          .then(() => {
            (window as ZoidWindow).xprops?.handleEndCall?.();
            sendData(userMe.id, { eventType: 'KICK', to: 'all' });
            (window as ZoidWindow).xprops?.handleLeaveCall?.();
          })
          .catch((e) => console.log(e));
      }
    };

    return {
      options,
      handleOptionSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
