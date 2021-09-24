<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ participants.length + 1 }})</small>
    </header>
    <main class="m-list__content">
      <div class="m-list__content__actions" v-show="isAdmin()">
        <span>
          {{
            isEveryoneActionsBlocked ? 'Limitar acciones ' : 'Liberar acciones'
          }}
        </span>

        <q-btn
          :icon="isEveryoneMicBlocked ? 'mic' : 'mic_off'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Mic)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="top middle"
            self="bottom middle"
            :offset="[50, 10]"
            transition-show="scale"
            transition-hide="scale"
          >
            <label class="">{{
              isEveryoneMicBlocked
                ? 'Desbloquear Microfono para la sala'
                : 'Bloquear Microfono para la sala'
            }}</label>
          </q-tooltip>
        </q-btn>

        <q-btn
          :icon="isEveryoneVideoBlocked ? 'videocam' : 'videocam_off'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Camera)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="top middle"
            self="bottom middle"
            :offset="[50, 10]"
            transition-show="scale"
            transition-hide="scale"
          >
            <label class="">{{
              isEveryoneVideoBlocked
                ? 'Desbloquear Camara para la sala'
                : 'Bloquear Camara para la sala'
            }}</label>
          </q-tooltip>
        </q-btn>

        <q-btn
          :icon="
            isEveryoneScreenShareBlocked
              ? 'desktop_windows'
              : 'desktop_access_disabled'
          "
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Screen)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="top middle"
            self="bottom middle"
            :offset="[50, 10]"
            transition-show="scale"
            transition-hide="scale"
          >
            <label class="">{{
              isEveryoneScreenShareBlocked
                ? 'Desbloquear Compartir Pantalla para la sala'
                : 'Bloquear Compartir Pantalla para la sala'
            }}</label>
          </q-tooltip>
        </q-btn>

        <q-btn
          :icon="isEveryoneActionsBlocked ? 'fas fa-lock-open' : 'fas fa-lock'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.All)"
          size="10px"
          :disable="!participants.length > 0"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="top middle"
            self="bottom middle"
            :offset="[50, 10]"
            transition-show="scale"
            transition-hide="scale"
          >
            <label class="">{{
              isEveryoneActionsBlocked
                ? 'Desbloquear acciones para todos'
                : 'Bloquear acciones para todos'
            }}</label>
          </q-tooltip>
        </q-btn>
      </div>
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

        <div class="m-list__content__userBox__actions" v-show="isAdmin()">
          <!-- <q-btn
            :icon="
              hasActionsBlocked(participant)
                ? 'fas fa-lock-open'
                : 'fas fa-lock'
            "
            @click="handlePartipantActions(participant)"
            style="z-index: 100"
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="top middle"
              self="bottom middle"
              :offset="[50, 10]"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                hasActionsBlocked(participant)
                  ? 'Desbloquear acciones'
                  : 'Bloquear acciones'
              }}</label>
            </q-tooltip>
          </q-btn> -->

          <q-btn
            :icon="isMicBlocked(participant) ? 'mic' : 'mic_off'"
            @click="handleParticipantActions(participant, LOCK_ACTION_TYPE.Mic)"
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="top middle"
              self="bottom middle"
              :offset="[50, 10]"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                isMicBlocked(participant)
                  ? 'Desbloquear Microfono'
                  : 'Bloquear Microfono'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="isVideoBlocked(participant) ? 'videocam' : 'videocam_off'"
            @click="
              handleParticipantActions(participant, LOCK_ACTION_TYPE.Camera)
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="top middle"
              self="bottom middle"
              :offset="[50, 10]"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                isVideoBlocked(participant)
                  ? 'Desbloquear Camara'
                  : 'Bloquear Camara'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              isScreenShareBlocked(participant)
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            @click="
              handleParticipantActions(participant, LOCK_ACTION_TYPE.Screen)
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="top middle"
              self="bottom middle"
              :offset="[50, 10]"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                isScreenShareBlocked(participant)
                  ? 'Desbloquear Compartir Pantalla'
                  : 'Bloquear Compartir Pantalla'
              }}</label>
            </q-tooltip>
          </q-btn>
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
import { Participant, LOCK_ACTION_TYPE } from '@/types';
import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const { participants, setParticipantActions, setEveryParticipantActions } =
      useHandleParticipants();

    const { userMe, isAdmin } = useUserMe();

    const { sendData } = useInitWebRTC();

    const isEveryoneMicBlocked = computed(
      () =>
        !participants.value.some(
          (participant) => participant?.isMicBlocked === false
        )
    );

    const isEveryoneVideoBlocked = computed(
      () =>
        !participants.value.some(
          (participant) => participant?.isVideoBlocked === false
        )
    );

    const isEveryoneScreenShareBlocked = computed(
      () =>
        !participants.value.some(
          (participant) => participant?.isScreenShareBlocked === false
        )
    );

    const isEveryoneActionsBlocked = computed(
      () =>
        isEveryoneMicBlocked.value &&
        isEveryoneVideoBlocked.value &&
        isEveryoneScreenShareBlocked.value
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

    const isMicBlocked = (participant: Participant) =>
      participants.value.find((part) => part.id === participant.id)
        ?.isMicBlocked === true;

    const isVideoBlocked = (participant: Participant) =>
      participants.value.find((part) => part.id === participant.id)
        ?.isVideoBlocked === true;

    const isScreenShareBlocked = (participant: Participant) =>
      participants.value.find((part) => part.id === participant.id)
        ?.isScreenShareBlocked === true;

    const handleParticipantActions = (
      participant: Participant,
      action: number
    ) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        participantId: participant.id,
        action: action,
      };

      if (action === LOCK_ACTION_TYPE.All) {
        if (isEveryoneActionsBlocked.value) {
          setParticipantActions(participant.id as string, action, false);
        } else {
          setParticipantActions(participant.id as string, action, true);
        }
      } else if (action === LOCK_ACTION_TYPE.Mic) {
        if (isMicBlocked(participant)) {
          setParticipantActions(participant.id as string, action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Camera) {
        if (isVideoBlocked(participant)) {
          setParticipantActions(participant.id as string, action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      } else {
        // LOCK_ACTION_TYPE.Screen
        if (isScreenShareBlocked(participant)) {
          setParticipantActions(participant.id as string, action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      }
    };

    const handleEveryoneActions = (action: number) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        action: action,
      };

      if (action === LOCK_ACTION_TYPE.All) {
        if (isEveryoneActionsBlocked.value) {
          setEveryParticipantActions(action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });
        } else {
          setEveryParticipantActions(action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Mic) {
        if (isEveryoneMicBlocked.value) {
          setEveryParticipantActions(action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });
        } else {
          setEveryParticipantActions(action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Camera) {
        if (isEveryoneVideoBlocked.value) {
          setEveryParticipantActions(action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });
        } else {
          setEveryParticipantActions(action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Screen) {
        if (isEveryoneScreenShareBlocked.value) {
          setEveryParticipantActions(action, false);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });
        } else {
          setEveryParticipantActions(action, true);

          sendData(userMe.id, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });
        }
      }

      // AllActionsBlocked
      // AllMicBlocked
      // AllCameraBlocked
      // AllShareScreenBlocked

      // if (isEveryoneBlocked.value) {
      //   unlockEveryParticipantActions();

      // sendData(userMe.id, {
      //   ...blockActions,
      //   eventType: 'SET_EVERYONE_ACTION',
      //   value: false,
      // });
      // } else {
      //   lockEveryParticipantActions();

      //   sendData(userMe.id, {
      //     ...blockActions,
      //     eventType: 'SET_EVERYONE_ACTION',
      //     value: true,
      //   });
      // }
    };

    return {
      participants,
      hasActionsBlocked,
      handleEveryoneActions,
      userMe,
      isAdmin,
      isEveryoneMicBlocked,
      isEveryoneVideoBlocked,
      isEveryoneScreenShareBlocked,
      isEveryoneActionsBlocked,
      isMicBlocked,
      isVideoBlocked,
      isScreenShareBlocked,
      handleParticipantActions,
      LOCK_ACTION_TYPE,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
