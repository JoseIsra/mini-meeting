<template>
  <section class="m-list">
    <header class="m-list__title">
      <label class="m-list__title__text">Lista de Usuarios</label>
      <small>En línea ({{ admittedParticipants.length + 1 }})</small>
      <q-btn
        v-show="userMe.roleId === 0 && roomState.roomRestriction != 0"
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
      ></q-btn>
      <q-btn
        v-show="$q.screen.lt.sm"
        flat
        round
        icon="close"
        size="15px"
        dense
        class="m-list__title__btn --close"
        @click="closeUserListPanel"
      />
    </header>
    <main class="m-list__content">
      <div class="m-list__content__actions" v-show="userMe.roleId === 0">
        <span> Acciones sala </span>

        <q-btn
          :icon="isEveryoneMicBlocked ? 'mic_off' : 'mic'"
          @click="handleEveryoneActions(LOCK_ACTION_TYPE.Mic)"
          :color="isEveryoneMicBlocked ? 'red' : ''"
          text-color="white"
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
          :color="isEveryoneVideoBlocked ? 'red' : ''"
          text-color="white"
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
          :color="isEveryoneScreenShareBlocked ? 'red' : ''"
          text-color="white"
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
        <aside class="m-list__content__userBox__avatar">
          <q-icon
            v-if="notificateHandUp(userMe.id)"
            name="front_hand"
            class="m-list__content__userBox__avatar__handIcon"
            size="20px"
          />
          <q-img
            v-else
            class="m-list__content__userBox__avatar__image"
            :src="userMe.avatar"
            alt="avatar-logo"
          />

          <!-- HOST - ADMIN  -->

          <q-avatar
            v-show="userMe.roleId === 0"
            class="m-list__content__userBox__avatar__token"
            color="blue-8"
            text-color="white"
            :icon="userMe.isHost ? 'fas fa-crown' : 'fas fa-user-shield'"
            size="18px"
          />
        </aside>

        <div class="m-list__content__userBox__name">{{ userMe.name }} (Tú)</div>
        <div class="m-list__content__userBox__actions">
          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
            :icon="userMe.isMicOn ? 'mic' : 'mic_off'"
            :color="userMe.isMicOn ? 'blue' : userMe.isMicBlocked ? 'red' : ''"
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isMicOn"> Microfono prendido </label>
              <label v-else-if="userMe.isMicBlocked">
                Microfono Bloqueado
              </label>
              <label v-else> Microfono apagado </label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
            :icon="userMe.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              userMe.isCameraOn ? 'blue' : userMe.isCameraBlocked ? 'red' : ''
            "
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isCameraOn"> Camara encendida </label>
              <label v-else-if="userMe.isCameraBlocked">
                Camara Bloqueada
              </label>
              <label v-else> Camara apagada </label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
            :icon="
              userMe.isScreenSharing
                ? 'desktop_windows'
                : 'desktop_access_disabled'
            "
            :color="
              userMe.isScreenSharing
                ? 'blue'
                : userMe.isScreenShareBlocked
                ? 'red'
                : ''
            "
            text-color="white"
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="userMe.isScreenSharing">
                Compartir pantalla activo
              </label>
              <label v-else-if="userMe.isScreenShareBlocked">
                Compartir pantalla Bloqueado
              </label>
              <label v-else> Compartir pantalla inactivo </label>
            </q-tooltip>
          </q-btn>

          <q-btn icon="fas fa-ellipsis-h" v-if="userMe.roleId === 0">
            <q-menu :offset="[60, 12]">
              <q-list>
                <div class="m-list__content__userBox__extra">
                  <q-btn
                    v-show="userMe.roleId === 0"
                    :icon="
                      mainViewState.pinnedUsers.includes(userMe.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(userMe.id)
                        ? removePinnedUserForAll(userMe.id)
                        : addPinnedUserForAll(userMe.id)
                    "
                    color="primary"
                    text-color="white"
                    :disable="
                      mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.ANYONE ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(userMe.id))
                    "
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label
                        v-if="mainViewState.pinnedUsers.includes(userMe.id)"
                      >
                        Desfijar para todos</label
                      >
                      <label v-else> Fijar para todos</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    :icon="
                      mainViewState.pinnedUsers.includes(userMe.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(userMe.id)
                        ? removePinnedUser(userMe.id)
                        : addPinnedUser(userMe.id)
                    "
                    :disable="
                      (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                        mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(userMe.id))
                    "
                  >
                    <q-tooltip class="bg-grey-10">
                      <label
                        v-if="mainViewState.pinnedUsers.includes(userMe.id)"
                        >Desfijar para mi
                      </label>
                      <label v-else>Fijar para mi</label>
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

          <q-btn
            v-else
            :icon="
              mainViewState.pinnedUsers.includes(userMe.id)
                ? 'location_disabled'
                : 'gps_fixed'
            "
            @click="addPinnedUser(userMe.id)"
            :disable="
              (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
              (mainViewState.pinnedUsers.length >= 4 &&
                !mainViewState.pinnedUsers.includes(userMe.id))
            "
          >
            <q-tooltip class="bg-grey-10">
              <label v-if="mainViewState.pinnedUsers.includes(userMe.id)"
                >Desfijar para mi
              </label>
              <label v-else>Fijar para mi</label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div
        class="m-list__content__userBox"
        v-for="participant in admittedParticipants"
        :key="participant.id"
      >
        <aside class="m-list__content__userBox__avatar">
          <q-btn
            v-if="notificateHandUp(participant.id)"
            class="m-list__content__userBox__avatar__iconBox"
            round
            push
            :ripple="false"
            v-on="
              userMe.roleId == 0
                ? { click: () => removeHandUp(participant.id) }
                : {}
            "
          >
            <q-icon
              name="front_hand"
              size="20px"
              class="m-list__content__userBox__avatar__handIcon"
            />
            <q-tooltip class="bg-grey-10" v-if="userMe.roleId == 0">
              Bajar mano</q-tooltip
            >
          </q-btn>
          <q-img
            v-else
            class="m-list__content__userBox__avatar__image"
            :src="participant.avatar"
            alt="avatar-logo"
          />

          <q-avatar
            v-show="participant.roleId !== 1"
            class="m-list__content__userBox__avatar__token"
            color="blue-8"
            text-color="white"
            :icon="participant.isHost ? 'fas fa-crown' : 'fas fa-user-shield'"
            size="18px"
          />
        </aside>
        <div class="m-list__content__userBox__name">{{ participant.name }}</div>

        <div
          class="m-list__content__userBox__actions"
          v-if="userMe.roleId === 0"
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
              <!-- Encedido Apagado Bloquear Desbloquear -->
              <label>{{ participantActionsToolTip(1, participant) }}</label>
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
              <label>{{ participantActionsToolTip(2, participant) }}</label>
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
              <label>{{ participantActionsToolTip(3, participant) }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn icon="fas fa-ellipsis-h" v-if="userMe.roleId === 0">
            <q-menu :offset="[60, 12]">
              <q-list>
                <div class="m-list__content__userBox__extra">
                  <q-btn
                    :icon="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? removePinnedUserForAll(participant.id)
                        : addPinnedUserForAll(participant.id)
                    "
                    color="primary"
                    text-color="white"
                    :disable="
                      mainViewState.locked === MAIN_VIEW_LOCKED_TYPE.ANYONE ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(participant.id))
                    "
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label
                        v-if="
                          mainViewState.pinnedUsers.includes(participant.id)
                        "
                      >
                        Desfijar para todos</label
                      >
                      <label v-else> Fijar para todos</label>
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    :icon="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? 'location_disabled'
                        : 'gps_fixed'
                    "
                    @click="
                      mainViewState.pinnedUsers.includes(participant.id)
                        ? removePinnedUser(participant.id)
                        : addPinnedUser(participant.id)
                    "
                    :disable="
                      (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                        mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
                      (mainViewState.pinnedUsers.length >= 4 &&
                        !mainViewState.pinnedUsers.includes(participant.id))
                    "
                  >
                    <q-tooltip
                      class="bg-grey-10"
                      anchor="bottom middle"
                      self="top middle"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <label
                        v-if="
                          mainViewState.pinnedUsers.includes(participant.id)
                        "
                      >
                        Desfijar para mi</label
                      >
                      <label v-else>Fijar para mi</label>
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
                      <label>Echar</label>
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

        <div v-else class="m-list__content__userBox__actions">
          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
            :icon="participant.isMicOn ? 'mic' : 'mic_off'"
            :color="
              participant.isMicOn
                ? 'blue'
                : participant.isMicBlocked
                ? 'red'
                : ''
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label>{{
                participant.isMicOn
                  ? 'Micrófono encendido'
                  : 'Micrófono apagado'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
            :icon="participant.isCameraOn ? 'videocam' : 'videocam_off'"
            :color="
              participant.isCameraOn
                ? 'blue'
                : participant.isCameraBlocked
                ? 'red'
                : ''
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
                participant.isCameraOn ? 'Cámara encendida' : 'Cámara apagada'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :class="[
              'm-list__content__userBox__actions__button',
              { '--noActionable': userMe.roleId === 1 },
            ]"
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
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label class="">{{
                participant.isScreenSharing
                  ? 'Compartir pantalla activo'
                  : 'Compartir pantalla inactivo'
              }}</label>
            </q-tooltip>
          </q-btn>

          <q-btn
            :icon="
              mainViewState.pinnedUsers.includes(participant.id)
                ? 'location_disabled'
                : 'gps_fixed'
            "
            @click="addPinnedUser(participant.id)"
            :disable="
              (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
                mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
              (mainViewState.pinnedUsers.length >= 4 &&
                !mainViewState.pinnedUsers.includes(participant.id))
            "
          >
            <q-tooltip
              class="bg-grey-10"
              anchor="bottom middle"
              self="top middle"
              transition-show="scale"
              transition-hide="scale"
            >
              <label v-if="mainViewState.pinnedUsers.includes(participant.id)">
                Desfijar para mi</label
              >
              <label v-else>Fijar para mi</label>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import {
  useHandleParticipants,
  useUserMe,
  useSidebarToogle,
  useToogleFunctions,
  useRoom,
  useInitWebRTC,
  useMainView,
} from '@/composables';
import { User } from '@/types';
import {
  MAIN_VIEW_LOCKED_TYPE,
  LOCK_ACTION_TYPE,
  USER_ROLE,
} from '@/utils/enums';
import { nanoid } from 'nanoid';

export default defineComponent({
  name: 'FuCooperateUsersList',
  setup() {
    const {
      mainViewState,
      addPinnedUserForAll,
      addPinnedUser,
      removePinnedUser,
      removePinnedUserForAll,
    } = useMainView();
    const {
      setParticipantActions,
      setEveryParticipantActions,
      waitingParticipants,
      admittedParticipants,
    } = useHandleParticipants();

    const { toggleParticipantPanel, setSidebarState } = useSidebarToogle();

    const { userMe } = useUserMe();

    const { sendData } = useInitWebRTC();

    const {
      roomState,
      setRoomMicState,
      setRoomCameraState,
      setRoomScreenShareState,
    } = useRoom();

    const { functionsOnMenuBar, removeHandNotification } = useToogleFunctions();

    const isEveryoneMicBlocked = computed(() => roomState.isMicBlocked);

    const isEveryoneVideoBlocked = computed(() => roomState.isCameraBlocked);

    const isEveryoneScreenShareBlocked = computed(
      () => roomState.isScreenShareBlocked
    );

    const isEveryoneActionsBlocked = computed(
      () =>
        isEveryoneMicBlocked.value &&
        isEveryoneVideoBlocked.value &&
        isEveryoneScreenShareBlocked.value
    );

    const isMicBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isMicBlocked === true;

    const isVideoBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isCameraBlocked === true;

    const isScreenShareBlocked = (participant: Partial<User>) =>
      admittedParticipants.value.find((part) => part.id === participant.id)
        ?.isScreenShareBlocked === true;

    const handleParticipantActions = (
      participant: Partial<User>,
      action: number
    ) => {
      if (participant.roleId === USER_ROLE.ADMINISTRATOR) {
        return;
      }

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

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Camera) {
        if (isVideoBlocked(participant)) {
          setParticipantActions(participant.id as string, action, false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      } else {
        if (isScreenShareBlocked(participant)) {
          setParticipantActions(participant.id as string, action, false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: false,
          });
        } else {
          setParticipantActions(participant.id as string, action, true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_PARTICIPANT_ACTION',
            value: true,
          });
        }
      }
    };

    const participantActionsToolTip = (
      action: number,
      participant: Partial<User>
    ) => {
      if (participant.roleId === USER_ROLE.REGULAR_PARTICIPANT) {
        switch (action) {
          case 1:
            return participant.isMicOn
              ? 'Microfono Encendido'
              : participant.isMicBlocked
              ? 'Desbloquear Microfono'
              : 'Bloquear Microfono';
            break;
          case 2:
            return participant.isCameraOn
              ? 'Camara encendida'
              : participant.isCameraBlocked
              ? 'Desbloquear Camara'
              : 'Bloquear Camara';
            break;
          case 3:
            return participant.isScreenSharing
              ? 'Compartiendo Pantalla'
              : participant.isScreenShareBlocked
              ? 'Desbloquear Compartir Pantalla'
              : 'Bloquear Compartir Pantalla';
            break;
          default:
            return 'Error';
            break;
        }
      } else {
        switch (action) {
          case 1:
            return participant.isMicOn
              ? 'Microfono Encendido'
              : 'Microfono Apagado';
            break;
          case 2:
            return participant.isCameraOn
              ? 'Camara Encendida'
              : 'Camara Apagada';
            break;
          case 3:
            return participant.isScreenSharing
              ? 'Compartiendo Pantalla'
              : 'Compartir Pantalla Apagada';
            break;
          default:
            return 'Error';
            break;
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

          setRoomMicState(false);
          setRoomCameraState(false);
          setRoomScreenShareState(false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(false),
            camera: Number(false),
            screenshare: Number(false),
          });
        } else {
          setEveryParticipantActions(action, true);

          setRoomMicState(true);
          setRoomCameraState(true);
          setRoomScreenShareState(true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(true),
            camera: Number(true),
            screenshare: Number(true),
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Mic) {
        if (isEveryoneMicBlocked.value) {
          setEveryParticipantActions(action, false);

          setRoomMicState(false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(false),
            camera: Number(roomState.isCameraBlocked),
            screenshare: Number(roomState.isScreenShareBlocked),
          });
        } else {
          setEveryParticipantActions(action, true);

          setRoomMicState(true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(true),
            camera: Number(roomState.isCameraBlocked),
            screenshare: Number(roomState.isScreenShareBlocked),
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Camera) {
        if (isEveryoneVideoBlocked.value) {
          setEveryParticipantActions(action, false);

          setRoomCameraState(false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(roomState.isMicBlocked),
            camera: Number(false),
            screenshare: Number(roomState.isScreenShareBlocked),
          });
        } else {
          setEveryParticipantActions(action, true);

          setRoomCameraState(true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(roomState.isMicBlocked),
            camera: Number(true),
            screenshare: Number(roomState.isScreenShareBlocked),
          });
        }
      } else if (action === LOCK_ACTION_TYPE.Screen) {
        if (isEveryoneScreenShareBlocked.value) {
          setEveryParticipantActions(action, false);

          setRoomScreenShareState(false);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: false,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(roomState.isMicBlocked),
            camera: Number(roomState.isCameraBlocked),
            screenshare: Number(false),
          });
        } else {
          setEveryParticipantActions(action, true);

          setRoomScreenShareState(true);

          sendData(roomState.hostId, {
            ...blockActions,
            eventType: 'SET_EVERYONE_ACTION',
            value: true,
          });

          window.xprops?.toggleLockAction?.({
            mic: Number(roomState.isMicBlocked),
            camera: Number(roomState.isCameraBlocked),
            screenshare: Number(true),
          });
        }
      }
    };

    const handleKickParticipant = (participant: Partial<User>) => {
      sendData(roomState.hostId, { eventType: 'KICK', to: participant.id });
    };

    const closeUserListPanel = () => {
      setSidebarState(false);
    };

    const notificateHandUp = (userId: string) => {
      return functionsOnMenuBar.handNotificationInfo.some(
        (notific) => notific.from == userId
      );
    };

    const removeHandUp = (userId: string) => {
      console.log(userId, 'bajando mano');
      removeHandNotification(userId);
      // updateHandNotification(false);
      sendData(roomState.hostId, {
        from: userId,
        eventType: 'NOHAND',
      });
    };

    return {
      waitingParticipants,
      admittedParticipants,
      toggleParticipantPanel,
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
      handleKickParticipant,
      roomState,
      closeUserListPanel,
      participantActionsToolTip,
      notificateHandUp,
      removeHandUp,
      mainViewState,
      addPinnedUser,
      addPinnedUserForAll,
      removePinnedUser,
      removePinnedUserForAll,
      MAIN_VIEW_LOCKED_TYPE,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUsersList.scss';
</style>
