<template>
  <section class="m-perifericsPanel">
    <p class="m-perifericsPanel__title">Control de periféricos</p>
    <q-toggle
      class="m-perifericsPanel__toggle"
      v-model="cooperateMicState"
      left-label
      label="Microfonos"
      :icon="cooperateMicState ? 'mic' : 'mic_off'"
    />

    <q-toggle
      class="m-perifericsPanel__toggle"
      v-model="cooperateCameraState"
      left-label
      label="Camaras"
      :icon="cooperateCameraState ? 'videocam' : 'videocam_off'"
    />

    <q-toggle
      class="m-perifericsPanel__toggle"
      v-model="cooperateScreenShareState"
      left-label
      label="Compartir Pantalla"
      :icon="cooperateScreenShareState ? 'monitor' : 'desktop_access_disabled'"
    />

    <!-- <div class="m-perifericsPanel__actions" style="height: 40px">
      <p class="m-perifericsPanel__actions__message">
        {{
          actionsActivated ? 'Acciones desbloqueadas' : 'Acciones bloqueadas'
        }}
      </p>

      <q-btn
        :icon="!actionsActivated ? 'fas fa-lock-open' : 'fas fa-lock'"
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
            !actionsActivated
              ? 'Desbloquear todas las acciones'
              : 'Bloquear todas las acciones'
          }}</label>
        </q-tooltip>
      </q-btn>
    </div> -->
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'FuParticipantPerifericPanel',
  setup() {
    const isMicLocked = window.xprops?.isMicLocked || false;

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = window.xprops?.isScreenShareLocked || false;

    const cooperateMicState = ref(!isMicLocked);

    const cooperateCameraState = ref(!isCameraLocked);

    const cooperateScreenShareState = ref(!isScreenShareLocked);

    // watch(
    //   [cooperateMicState, cooperateCameraState, cooperateScreenShareState],
    //   ([mic, camera, screenShare], [prevMic, prevCamera, prevScreenShare]) => {
    //     const haveAllChanged =
    //       prevMic !== mic &&
    //       camera !== prevCamera &&
    //       screenShare !== prevScreenShare;

    //     const individualState = {
    //       mic: Number(!mic),
    //       camera: Number(!camera),
    //       screenshare: Number(!screenShare),
    //     } as lockAction;

    //     if (haveAllChanged) {
    //       if (mic && camera && screenShare) {
    //         const state = {
    //           mic: 0,
    //           camera: 0,
    //           screenshare: 0,
    //         } as lockAction;

    //         sendData(userMe.id, {
    //           eventType: 'SET_EVERYONE_ACTION',
    //           action: LOCK_ACTION_TYPE.All,
    //           value: false,
    //         });

    //         window.xprops?.toggleLockAction?.(state);
    //       }

    //       if (!mic && !camera && !screenShare) {
    //         const state = {
    //           mic: 1,
    //           camera: 1,
    //           screenshare: 1,
    //         } as lockAction;

    //         sendData(userMe.id, {
    //           eventType: 'SET_EVERYONE_ACTION',
    //           action: LOCK_ACTION_TYPE.All,
    //           value: true,
    //         });

    //         window.xprops?.toggleLockAction?.(state);
    //       }
    //     } else {
    //       if (mic !== prevMic) {
    //         console.log('Toggle mic: ', Number(!mic));

    //         sendData(userMe.id, {
    //           eventType: 'SET_EVERYONE_ACTION',
    //           action: LOCK_ACTION_TYPE.Mic,
    //           value: !mic,
    //         });

    //         window.xprops?.toggleLockAction?.(individualState);
    //       }

    //       if (camera !== prevCamera) {
    //         console.log('Toggle camera: ', Number(!camera));

    //         sendData(userMe.id, {
    //           eventType: 'SET_EVERYONE_ACTION',
    //           action: LOCK_ACTION_TYPE.Camera,
    //           value: !camera,
    //         });

    //         window.xprops?.toggleLockAction?.(individualState);
    //       }

    //       if (screenShare !== prevScreenShare) {
    //         console.log('Toggle screenshare: ', Number(!screenShare));

    //         sendData(userMe.id, {
    //           eventType: 'SET_EVERYONE_ACTION',
    //           action: LOCK_ACTION_TYPE.Screen,
    //           value: !screenShare,
    //         });

    //         window.xprops?.toggleLockAction?.(individualState);
    //       }
    //     }
    //   }
    // );

    const actionsActivated = computed(
      () => false
      //     cooperateMicState.value &&
      //     cooperateScreenShareState.value &&
      //     cooperateCameraState.value
    );

    const handleAllActions = () => {
      console.log('HANDLE ALL ACTIONS MY FRIEND ☢️');
      // if (actionsActivated.value) {
      //   cooperateMicState.value = false;
      //   cooperateScreenShareState.value = false;
      //   cooperateCameraState.value = false;
      // } else {
      //   cooperateMicState.value = true;
      //   cooperateScreenShareState.value = true;
      //   cooperateCameraState.value = true;
      // }
    };

    return {
      cooperateMicState,
      cooperateCameraState,
      cooperateScreenShareState,
      handleAllActions,
      actionsActivated,
    };
  },
});
</script>

<style scoped lang="scss">
@import './participantPerifericPanel.scss';
</style>
