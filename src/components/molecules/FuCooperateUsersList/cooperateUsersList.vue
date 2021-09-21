<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ participants.length + 1 }})</small>
    </header>
    <main class="m-list__content">
      <div class="m-list__content__userBox">
        <div class="m-list__content__userBox__user">
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
          class="m-list__content__userBox__actions"
          v-show="isAdmininistrator && participants.length > 0"
        >
          <q-btn
            :icon="isEveryoneBlocked ? 'fas fa-lock' : 'fas fa-lock-open'"
            @click="handleEveryoneActions"
          />
        </div>
      </div>
      <div
        class="m-list__content__userBox"
        v-for="participant in participants"
        :key="participant.id"
      >
        <div class="m-list__content__userBox__user">
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

        <div
          class="m-list__content__userBox__actions"
          v-show="isAdmininistrator"
        >
          <q-btn
            :icon="
              hasActionsBlocked(participant)
                ? 'fas fa-microphone'
                : 'fas fa-microphone-slash'
            "
            @click="handlePartipantActions(participant)"
          />
          <!-- <q-btn
            icon="fas fa-video-slash"
          />
            <q-btn
            icon="desktop_access_disabled"
          /> -->
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useHandleParticipants } from '@/composables/participants';
import { useUserMe } from '@/composables/userMe';
import { useInitWebRTC } from '@/composables/antMedia';
import { Participant } from '@/types';
import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const {
      participants,
      unlockParticipantActions,
      lockParticipantActions,
      unlockEveryParticipantActions,
      lockEveryParticipantActions,
    } = useHandleParticipants();

    const { userMe, isAdmininistrator } = useUserMe();

    const { sendData } = useInitWebRTC();

    const isEveryoneBlocked = computed(() =>
      participants.value.some(
        (participant) =>
          participant?.isMicBlocked === false ||
          participant?.isVideoBlocked === false ||
          participant?.isScreenShareBlocked === false
      )
    );

    const hasActionsBlocked = (participant: Participant) => {
      const participantActions = participants.value.find(
        (part) => part.id === participant.id
      );
      return (
        participantActions?.isMicBlocked === true &&
        participantActions?.isVideoBlocked === true &&
        participantActions?.isScreenShareBlocked === true
      );
    };

    const handlePartipantActions = (participant: Participant) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        participantId: participant.id,
      };

      if (hasActionsBlocked(participant)) {
        unlockParticipantActions(participant);
        sendData(userMe.id, {
          ...blockActions,
          eventType: 'UNBLOCK_PARTICIPANT_ACTION',
        });
        // desbloquear
      } else {
        lockParticipantActions(participant);
        sendData(userMe.id, {
          ...blockActions,
          eventType: 'BLOCK_PARTICIPANT_ACTION',
        });
      }
    };

    const handleEveryoneActions = () => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
      };

      console.log(blockActions);

      if (isEveryoneBlocked.value) {
        unlockEveryParticipantActions();
        sendData(userMe.id, {
          ...blockActions,
          eventType: 'UNBLOCK_EVERYONE_ACTION',
        });
      } else {
        lockEveryParticipantActions();
        sendData(userMe.id, {
          ...blockActions,
          eventType: 'BLOCK_EVERYONE_ACTION',
        });
      }
    };

    // const areAllBlocked = () => participants.value.some(participant => participant.isBlock === false)

    return {
      participants,
      hasActionsBlocked,
      handlePartipantActions,
      handleEveryoneActions,
      userMe,
      isAdmininistrator,
      isEveryoneBlocked,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
