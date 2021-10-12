<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ admittedParticipants.length + 1 }})</small>
      <q-btn
        v-show="userMe.roleId === 0"
        :label="
          waitingParticipants.length > 0
            ? `En espera (${waitingParticipants.length})`
            : 'Sin solicitudes'
        "
        :color="waitingParticipants.length > 0 ? 'green' : 'grey'"
        text-color="white"
        icon="fa fa-clock"
        style="margin: 16px 0; text-transform: capitalize"
        @click="toggleParticipantPanel"
        :disable="!waitingParticipants.length > 0"
      ></q-btn>
    </header>
    <main class="m-list__content">
      <div class="m-list__content__actions" v-show="userMe.roleId === 0">
        <span>
          {{
            isEveryoneActionsBlocked ? 'Limitar acciones ' : 'Liberar acciones'
          }}
        </span>

        <q-btn
          :icon="isEveryoneMicBlocked ? 'mic_off' : 'mic'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Mic)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="bottom middle"
            self="top middle"
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
          :icon="isEveryoneVideoBlocked ? 'videocam_off' : 'videocam'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Camera)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="bottom middle"
            self="top middle"
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
              ? 'desktop_access_disabled'
              : 'desktop_windows'
          "
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Screen)"
          size="8px"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="bottom middle"
            self="top middle"
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
          :icon="isEveryoneActionsBlocked ? 'fas fa-lock' : 'fas fa-lock-open'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.All)"
          size="10px"
          :disable="!admittedParticipants.length > 0"
        >
          <q-tooltip
            class="bg-grey-10"
            anchor="bottom middle"
            self="top middle"
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
          </aside>
          <label>{{ userMe.name }} (Tú)</label>
        </div>

        <div class="m-list__content__userBox__actions">
          <q-btn
            :icon="userMe.isMicOn ? 'mic' : 'mic_off'"
            :color="
              userMe.isMicOn ? 'blue' : roomState.isMicBlocked ? 'red' : ''
            "
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isMicOn"> Microfono prendido </label>
              <label v-else-if="roomState.isMicBlocked">
                Microfono bloqueado
              </label>
              <label v-else> Microfono apagado </label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="userMe.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              userMe.isCameraOn
                ? 'blue'
                : roomState.isCameraBlocked
                ? 'red'
                : ''
            "
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isCameraOn"> Camara encendida </label>
              <label v-else-if="roomState.isCameraBlocked">
                Camara bloqueada
              </label>
              <label v-else> Camara apagada </label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              userMe.isScreenSharing
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :color="
              userMe.isScreenSharing
                ? 'blue'
                : roomState.isScreenShareBlocked
                ? 'red'
                : ''
            "
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isScreenSharing">
                Compartir pantalla activo
              </label>
              <label v-else-if="roomState.isScreenShareBlocked">
                Compartir pantalla bloqueado
              </label>
              <label v-else> Compartir pantalla inactivo </label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              listenFullScreen.id == userMe.id
                ? 'location_disabled'
                : 'gps_fixed'
            "
            @click="activeFullScreen(userMe)"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="listenFullScreen.id == userMe.id"
                >Estás fijado
              </label>
              <label v-else>Fijarte a ti mismo</label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div
        class="m-list__content__userBox"
        v-for="participant in admittedParticipants"
        :key="participant.id"
      >
        <div class="m-list__content__userBox__user">
          <aside class="m-list__content__userBox__avatar">
            <q-img
              class="m-list__content__userBox__avatar__image"
              :src="participant.avatar"
              alt="avatar-logo"
            />
            <!-- <div class="m-list__content__userBox__avatar__icons">
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
            </div> -->
          </aside>
          <label>{{ participant.name }}</label>
        </div>

        <div
          class="m-list__content__userBox__actions"
          v-show="userMe.roleId === 0"
        >
          <q-btn
            :icon="participant.isMicOn ? 'mic' : 'mic_off'"
            :color="
              participant.isMicOn
                ? 'blue'
                : participant.isMicBlocked
                ? 'red'
                : ''
            "
            @click="handleParticipantActions(participant, LOCK_ACTION_TYPE.Mic)"
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{
                participant.isMicBlocked
                  ? 'Desbloquear Microfono'
                  : 'Bloquear Microfono'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="participant.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              participant.isCameraOn
                ? 'blue'
                : participant.isCameraBlocked
                ? 'red'
                : ''
            "
            @click="
              handleParticipantActions(participant, LOCK_ACTION_TYPE.Camera)
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                participant.isCameraBlocked
                  ? 'Desbloquear Camara'
                  : 'Bloquear Camara'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              participant.isScreenSharing
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :color="
              participant.isScreenSharing
                ? 'blue'
                : participant.isScreenShareBlocked
                ? 'red'
                : ''
            "
            @click="
              handleParticipantActions(participant, LOCK_ACTION_TYPE.Screen)
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                participant.isScreenShareBlocked
                  ? 'Desbloquear Compartir Pantalla'
                  : 'Bloquear Compartir Pantalla'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn icon="fas fa-ellipsis-h">
            <q-menu :offset="[60, 12]">
              <q-list>
                <div class="m-list__content__userBox__extra">
                  <q-btn
                    :icon="
                      listenFullScreen.id == participant.id
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="activeEveryoneFullScreen(participant)"
                    color="primary"
                    text-color="white"
                  >
                    <!-- @click="listenFullScreen.id === participant.id ? activeEveryoneFullScreen(participant) : cancelEveryoneFullScreen" -->

                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label v-if="listenFullScreen.id === participant.id">
                        Usuario fijado</label
                      >
                      <label v-else> Fijar usuario para todos</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    :icon="
                      listenFullScreen.id == participant.id
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="activeFullScreen(participant)"
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label v-if="listenFullScreen.id == participant.id">
                        Usuario fijado</label
                      >
                      <label v-else> Fijar usuario</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    icon="fas fa-sign-out-alt"
                    @click="handleKickParticipant(participant)"
                    color="red"
                    text-color="white"
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label>Quitar participante</label>
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-list>
            </q-menu>

            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>Opciones</label>
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
import { User, useUserMe } from '@/composables/userMe';
import { useInitWebRTC } from '@/composables/antMedia';
import { Participant } from '@/types';
import { LOCK_ACTION_TYPE } from '@/utils/enums';
import { nanoid } from 'nanoid';
import { useSidebarToogle } from '@/composables';
import { useToogleFunctions } from '@/composables';
import { useRoom } from '@/composables/room';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const {
      setParticipantActions,
      setEveryParticipantActions,
      waitingParticipants,
      admittedParticipants,
    } = useHandleParticipants();

    const { toggleParticipantPanel } = useSidebarToogle();

    const { userMe } = useUserMe();

    const { sendData } = useInitWebRTC();

    const { roomState, updateFocus } = useRoom();

    const {
      setFullScreen,
      setFullScreenObject,
      isFullScreen,
      fullScreenObject,
      clearFullScreenObject,
    } = useToogleFunctions();

    const listenFullScreen = computed(() => {
      if (fullScreenObject.id) return fullScreenObject;
      return '';
    });

    const isEveryoneMicBlocked = computed(
      () =>
        !admittedParticipants.value.some(
          (participant) => participant?.isMicBlocked === false
        )
    );

    const isEveryoneVideoBlocked = computed(
      () =>
        !admittedParticipants.value.some(
          (participant) => participant?.isCameraBlocked === false
        )
    );

    const isEveryoneScreenShareBlocked = computed(
      () =>
        !admittedParticipants.value.some(
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
      const participantActions = admittedParticipants.value.find(
        (part) => part.id === participant.id
      );

      return (
        participantActions?.isMicBlocked === true &&
        participantActions?.isCameraBlocked === true &&
        participantActions?.isScreenShareBlocked === true
      );
    };

    const isMicBlocked = (participant: Participant) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isMicBlocked === true;

    const isVideoBlocked = (participant: Participant) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isCameraBlocked === true;

    const isScreenShareBlocked = (participant: Participant) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
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

    const handleKickParticipant = (participant: Participant) => {
      console.log('Quitar participante: ', participant.id);
      sendData(userMe.id, { eventType: 'KICK', to: participant.id });
    };

    const activeEveryoneFullScreen = (arg: User) => {
      // if (roomState.focused && isFullScreen.value) {
      //   setFullScreenObject(arg);
      //   updateFocus(arg);
      //   return;
      // }

      // setFullScreen('user');
      // setFullScreenObject(arg);
      // updateFocus(arg);

      if (isFullScreen.value) {
        setFullScreenObject(arg);
        updateFocus(arg);
        return;
      }

      setFullScreen('user');
      setFullScreenObject(arg);
      updateFocus(arg);

      sendData(userMe.id, {
        eventType: 'SET_FULL_SCREEN',
        participant: arg,
        mode: 'user',
      });
    };

    const cancelEveryoneFullScreen = () => {
      updateFocus(null);
      setFullScreen('none');
      clearFullScreenObject();
    };

    const activeFullScreen = (arg: User) => {
      if (isFullScreen.value) {
        setFullScreenObject(arg);
        return;
      }
      setFullScreen('user');
      setFullScreenObject(arg);
    };

    return {
      waitingParticipants,
      admittedParticipants,
      toggleParticipantPanel,
      hasActionsBlocked,
      handleEveryoneActions,
      userMe,
      isEveryoneMicBlocked,
      isEveryoneVideoBlocked,
      isEveryoneScreenShareBlocked,
      isEveryoneActionsBlocked,
      isMicBlocked,
      isVideoBlocked,
      isScreenShareBlocked,
      handleParticipantActions,
      LOCK_ACTION_TYPE,
      activeFullScreen,
      isFullScreen,
      fullScreenObject,
      listenFullScreen,
      handleKickParticipant,
      activeEveryoneFullScreen,
      cancelEveryoneFullScreen,
      roomState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
