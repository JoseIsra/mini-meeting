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
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useHandleParticipants, useRoom, useUserMe } from '@/composables';
import { useLockParticipantActions } from '@/composables/lockActions';
import { LockActionsData, LockCallback } from '@/types';

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

    const { admittedParticipants } = useHandleParticipants();
    const { userMe } = useUserMe();
    const { lockActionsAllowed } = useLockParticipantActions();

    let blockAllPeriferics = ref(false);

    const lockPerifericToParticipants = (
      cb: LockCallback,
      action: number,
      lockData: LockActionsData
    ) => {
      admittedParticipants.value.map((participant) => {
        cb(participant, action, {
          ...lockData,
          participantId: participant.id,
        });
      });
    };

    watch(cooperateMicState, (value) => {
      const lockData = {
        streamId: userMe.id,
        action: 1,
      };
      const lockAction = lockActionsAllowed.get(1) as LockCallback;
      if (value) {
        setRoomMicState(false);
        lockPerifericToParticipants(lockAction, 1, lockData);
        window.xprops?.toggleLockAction?.({
          mic: Number(false),
          camera: Number(roomState.isCameraBlocked),
          screenshare: Number(roomState.isScreenShareBlocked),
        });
      } else {
        setRoomMicState(true);
        lockPerifericToParticipants(lockAction, 1, lockData);
        window.xprops?.toggleLockAction?.({
          mic: Number(true),
          camera: Number(roomState.isCameraBlocked),
          screenshare: Number(roomState.isScreenShareBlocked),
        });
      }
    });

    watch(cooperateCameraState, (value) => {
      const lockData = {
        streamId: userMe.id,
        action: 2,
      };
      const lockAction = lockActionsAllowed.get(2) as LockCallback;
      if (value) {
        setRoomCameraState(false);
        lockPerifericToParticipants(lockAction, 2, lockData);
        window.xprops?.toggleLockAction?.({
          mic: Number(roomState.isMicBlocked),
          camera: Number(false),
          screenshare: Number(roomState.isScreenShareBlocked),
        });
      } else {
        setRoomCameraState(true);
        lockPerifericToParticipants(lockAction, 2, lockData);
        window.xprops?.toggleLockAction?.({
          mic: Number(roomState.isMicBlocked),
          camera: Number(true),
          screenshare: Number(roomState.isScreenShareBlocked),
        });
      }
    });

    watch(cooperateScreenShareState, (value) => {
      const lockData = {
        streamId: userMe.id,
        action: 3,
      };
      const lockAction = lockActionsAllowed.get(3) as LockCallback;

      if (value) {
        lockPerifericToParticipants(lockAction, 3, lockData);
        setRoomScreenShareState(false);
        window.xprops?.toggleLockAction?.({
          mic: Number(roomState.isMicBlocked),
          camera: Number(roomState.isCameraBlocked),
          screenshare: Number(false),
        });
      } else {
        setRoomScreenShareState(true);
        lockPerifericToParticipants(lockAction, 3, lockData);
        window.xprops?.toggleLockAction?.({
          mic: Number(roomState.isMicBlocked),
          camera: Number(roomState.isCameraBlocked),
          screenshare: Number(true),
        });
      }
    });

    return {
      cooperateMicState,
      cooperateCameraState,
      cooperateScreenShareState,
      roomState,
      blockAllPeriferics,
    };
  },
});
</script>

<style scoped lang="scss">
@import './participantPerifericPanel.scss';
</style>
