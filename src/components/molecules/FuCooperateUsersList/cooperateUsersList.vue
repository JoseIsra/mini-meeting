<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ participants.length + 1 }})</small>
    </header>
    <main class="m-list__content">
      <div class="m-list__content__userBox">
        <aside class="m-list__content__userBox__avatar">
          <q-img
            class="m-list__content__userBox__avatar__image"
            :src="userMe.avatar"
            alt="avatar-logo"
          />
          <q-icon
            :name="userMe.isMicOn ? 'mic' : 'mic_off'"
            class="m-list__content__userBox__avatar__mic"
            :color="userMe.isMicOn ? 'white' : 'red'"
            size="18px"
          />
          <q-icon
            class="m-list__content__userBox__avatar__cam"
            :name="userMe.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="userMe.isCameraOn ? 'white' : 'red'"
          />
        </aside>
        <label>{{ userMe.name }}</label>
      </div>
      <div
        class="m-list__content__userBox"
        v-for="participant in participants"
        :key="participant.id"
      >
        <aside class="m-list__content__userBox__avatar">
          <q-img
            class="m-list__content__userBox__avatar__image"
            :src="participant.avatar"
            alt="avatar-logo"
          />
          <q-icon
            class="m-list__content__userBox__avatar__mic"
            :name="participant.isMicOn ? 'mic' : 'mic_off'"
            :color="participant.isMicOn ? 'white' : 'red'"
            size="18px"
          />
          <q-icon
            class="m-list__content__userBox__avatar__cam"
            :name="participant.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="participant.isCameraOn ? 'white' : 'red'"
          />
        </aside>
        <label>{{ participant.name }}</label>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useHandleParticipants } from '@/composables/participants';
import { useUserMe } from '@/composables/userMe';
export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const { participants } = useHandleParticipants();
    const { userMe } = useUserMe();
    return {
      participants,
      userMe,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
