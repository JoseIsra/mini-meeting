<template>
  <section class="m-perifericsPanel">
    <p class="m-perifericsPanel__title">Control de periféricos</p>
    <q-list class="m-perifericsPanel__toggleBox">
      <q-item tag="label" v-ripple="{ color: 'blue-3' }">
        <q-item-section>
          <q-item-label class="m-perifericsPanel__toggleBox__hint --mainHint"
            >Micrófonos</q-item-label
          >
          <q-item-label
            class="m-perifericsPanel__toggleBox__hint --subHint"
            caption
            >Controla si todos en la sala pueden activar sus
            micrófonos</q-item-label
          >
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            class="m-perifericsPanel__toggle"
            v-model="cooperateMicState"
            size="50px"
            :disable="blockAllPeriferics"
            :icon="cooperateMicState ? 'mic' : 'mic_off'"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple="{ color: 'blue-3' }">
        <q-item-section>
          <q-item-label class="m-perifericsPanel__toggleBox__hint --mainHint"
            >Cámaras</q-item-label
          >
          <q-item-label
            caption
            class="m-perifericsPanel__toggleBox__hint --subHint"
            >Controla si todos en la sala pueden encender sus
            cámaras</q-item-label
          >
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            class="m-perifericsPanel__toggle"
            size="50px"
            v-model="cooperateCameraState"
            :disable="blockAllPeriferics"
            :icon="cooperateCameraState ? 'videocam' : 'videocam_off'"
          />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple="{ color: 'blue-3' }">
        <q-item-section>
          <q-item-label class="m-perifericsPanel__toggleBox__hint --mainHint"
            >Compartir pantalla</q-item-label
          >
          <q-item-label
            caption
            class="m-perifericsPanel__toggleBox__hint --subHint"
            >Controla si todos en la sala pueden compartir
            pantalla</q-item-label
          >
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            class="m-perifericsPanel__toggle"
            size="50px"
            v-model="cooperateScreenShareState"
            :disable="blockAllPeriferics"
            :icon="
              cooperateScreenShareState ? 'monitor' : 'desktop_access_disabled'
            "
          />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- <div class="m-perifericsPanel__actions" style="height: 40px">
      <p class="m-perifericsPanel__actions__message">
        {{
          isEveryoneActionsBlocked
            ? 'Desbloquear todas las acciones'
            : 'Bloquear todas las acciones'
        }}
      </p>

      <q-btn
        :icon="!isEveryoneActionsBlocked ? 'fas fa-lock-open' : 'fas fa-lock'"
        @click="handleAllActions"
        push
        class="m-perifericsPanel__actions__btn"
        size="12px"
        color="blue-9"
      >
        <q-tooltip
          class="bg-grey-10"
          anchor="bottom middle"
          self="top middle"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="m-perifericsPanel__actions__tooltip">{{
            !isEveryoneActionsBlocked
              ? 'Bloquear todas las acciones'
              : 'Desbloquear todas las acciones'
          }}</label>
        </q-tooltip>
      </q-btn>
    </div> -->
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { nanoid } from 'nanoid';
import { useHandleParticipants, useRoom, useUserMe } from '@/composables';
import { useInitWebRTC } from '@/composables/antMedia';
import { warningMessage } from '@/utils/notify';

// 0-> ALL, 1-> MIC, 2-> CAMERA, 3->SCREEN

export default defineComponent({
  name: 'FuParticipantPerifericPanel',
  setup() {
    const {
      roomState,
      setRoomMicState,
      setRoomCameraState,
      setRoomScreenShareState,
    } = useRoom();

    const cooperateMicState = ref(!roomState.isMicBlocked);

    const cooperateCameraState = ref(!roomState.isCameraBlocked);

    const cooperateScreenShareState = ref(!roomState.isScreenShareBlocked);

    const { setEveryParticipantActions } = useHandleParticipants();
    const { userMe } = useUserMe();
    const { sendData } = useInitWebRTC();

    const isEveryoneActionsBlocked = computed(
      () =>
        roomState.isMicBlocked &&
        roomState.isCameraBlocked &&
        roomState.isScreenShareBlocked
    );
    let blockAllPeriferics = ref(false);

    watch(cooperateMicState, (value) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        action: 1,
      };
      if (value) {
        console.log('TRUE MODE', value);
        setEveryParticipantActions(1, false);

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
        setEveryParticipantActions(1, true);
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
    });

    watch(cooperateCameraState, (value) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        action: 2,
      };
      if (value) {
        setEveryParticipantActions(2, false);

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
        setEveryParticipantActions(2, true);

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
    });

    watch(cooperateScreenShareState, (value) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        action: 3,
      };

      if (value) {
        setEveryParticipantActions(3, false);

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
        setEveryParticipantActions(3, true);

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
    });

    const control__participants__actions = (arg: boolean) => {
      const blockActions = {
        id: nanoid(),
        streamId: userMe.id,
        action: 0,
      };
      if (arg) {
        cooperateMicState.value = false;
        cooperateCameraState.value = false;
        cooperateScreenShareState.value = false;

        setEveryParticipantActions(0, true);

        setRoomMicState(true);
        setRoomCameraState(true);
        setRoomScreenShareState(true);

        sendData(roomState.hostId, {
          ...blockActions,
          eventType: 'SET_EVERYONE_ACTION',
          value: true,
        });
        warningMessage('Acciones bloqueadas en la sala');
        window.xprops?.toggleLockAction?.({
          mic: Number(true),
          camera: Number(true),
          screenshare: Number(true),
        });
      } else {
        cooperateMicState.value = true;
        cooperateCameraState.value = true;
        cooperateScreenShareState.value = true;
        setEveryParticipantActions(0, false);

        setRoomMicState(false);
        setRoomCameraState(false);
        setRoomScreenShareState(false);

        sendData(roomState.hostId, {
          ...blockActions,
          eventType: 'SET_EVERYONE_ACTION',
          value: false,
        });
        warningMessage('Acciones desbloqueadas en la sala');
        window.xprops?.toggleLockAction?.({
          mic: Number(false),
          camera: Number(false),
          screenshare: Number(false),
        });
      }
    };

    const handleAllActions = () => {
      blockAllPeriferics.value = !blockAllPeriferics.value;
      control__participants__actions(blockAllPeriferics.value);
    };

    return {
      cooperateMicState,
      cooperateCameraState,
      cooperateScreenShareState,
      handleAllActions,
      isEveryoneActionsBlocked,
      roomState,
      blockAllPeriferics,
    };
  },
});
</script>

<style scoped lang="scss">
@import './participantPerifericPanel.scss';
</style>
