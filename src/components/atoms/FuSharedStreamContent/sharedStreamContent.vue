<template>
  <section class="m-shared">
    <header class="m-shared__head">
      <h4 class="m-shared__head__message">Sala creada</h4>
      <q-btn
        icon="close"
        color="white"
        round
        flat
        dense
        @click="closeInfoRoomCard"
      />
    </header>
    <main class="m-shared__body">
      <p class="m-shared__body__message">
        Puedes compartir este enlace de la sala con las personas que quieras que
        se unan
      </p>
      <div class="m-shared__body__inputBox">
        <input
          ref="inputtarget"
          readonly
          :value="sharedLinkOnInput"
          class="m-shared__body__input"
        />
        <q-btn
          icon="content_copy"
          round
          push
          color="white"
          text-color="blue"
          :ripple="false"
          class="m-shared__body__copyBtn"
          @click="copySharedLink"
        >
          <q-tooltip
            :class="[unCopyText ? 'bg-primary' : 'bg-grey-10']"
            transition-show="rotate"
            transition-hide="rotate"
          >
            <label class="m-shared__body__copyBtn__label">
              {{ toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </div>

      <div class="m-shared__admin" v-show="isAdmin()">
        <div class="m-shared__admin__actions">
          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateMicState"
            left-label
            :label="
              cooperateMicState
                ? 'Microfonos habilitados'
                : 'Microfonos deshabilitados'
            "
            :icon="cooperateMicState ? 'mic' : 'mic_off'"
          />

          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateCameraState"
            left-label
            :label="
              cooperateCameraState
                ? 'Camaras habilitada'
                : 'Camaras deshabilitada'
            "
            :icon="cooperateCameraState ? 'videocam' : 'videocam_off'"
          />

          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateScreenShareState"
            left-label
            :label="
              cooperateScreenShareState
                ? 'Compartir Pantalla habilitado'
                : 'Compartir Pantalla bloqueado'
            "
            :icon="
              cooperateScreenShareState ? 'monitor' : 'desktop_access_disabled'
            "
          />

          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateActionsState"
            left-label
            :label="
              cooperateActionsState
                ? 'Acciones habilitadas'
                : 'Acciones bloqueadas'
            "
            :icon="cooperateActionsState ? 'fas fa-lock-open' : 'fas fa-lock'"
          />
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useUserMe } from '@/composables/userMe';
import { ZoidWindow } from '@/types/zoid';
import { LOCK_ACTION_TYPE, lockAction } from '@/types/index';

export default defineComponent({
  name: 'FuSharedStreamContent',
  props: {
    sharedLink: {
      type: String,
    },
    unCopyText: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    let sharedLinkOnInput = ref(props.sharedLink);

    const { isAdmin } = useUserMe();

    const isMicLcked = (window as ZoidWindow)?.xprops?.isMicLocked || false;

    const isCameraLocked =
      (window as ZoidWindow)?.xprops?.isCameraLocked || false;

    const isScreenShareLocked =
      (window as ZoidWindow)?.xprops?.isScreenShareLocked || false;

    const cooperateMicState = ref(!isMicLcked);

    const cooperateCameraState = ref(!isCameraLocked);

    const cooperateScreenShareState = ref(!isScreenShareLocked);

    const cooperateActionsState = ref(
      !isScreenShareLocked && !isCameraLocked && !isMicLcked
    );

    watch(cooperateActionsState, (value) => {
      cooperateMicState.value = value;
      cooperateCameraState.value = value;
      cooperateScreenShareState.value = value;
    });

    watch(
      [
        cooperateMicState,
        cooperateCameraState,
        cooperateScreenShareState,
        cooperateActionsState,
      ],
      (
        [mic, camera, screenShare, all],
        [prevMic, prevCamera, prevScreenShare, prevAll]
      ) => {
        const allChanged = all !== prevAll;

        if (mic !== prevMic && !allChanged) {
          console.log('Se cambio mic');

          const lockAction = {
            type: LOCK_ACTION_TYPE.Mic,
            state: Number(mic),
          } as lockAction;

          (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
        }

        if (camera !== prevCamera && !allChanged) {
          console.log('Se cambio camera');

          const lockAction = {
            type: LOCK_ACTION_TYPE.Camera,
            state: Number(camera),
          } as lockAction;

          (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
        }

        if (screenShare !== prevScreenShare && !allChanged) {
          console.log('Se cambio screenShare');

          const lockAction = {
            type: LOCK_ACTION_TYPE.Screen,
            state: Number(screenShare),
          } as lockAction;

          (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
        }

        if (allChanged) {
          const lockAction = {
            type: LOCK_ACTION_TYPE.All,
            state: Number(all),
          } as lockAction;

          (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
        }

        if (mic && camera && screenShare) {
          cooperateActionsState.value = true;
        } else if (!mic && !camera && !screenShare) {
          cooperateActionsState.value = false;
        }
      }
    );

    const toolTipMessage = computed(() => {
      return props.unCopyText ? 'Enlace copiado' : 'Copiar enlace';
    });

    const copySharedLink = () => {
      emit('copy-shared-link', sharedLinkOnInput.value);
    };

    const closeInfoRoomCard = () => {
      emit('close-room-info-card');
    };

    return {
      sharedLinkOnInput,
      copySharedLink,
      toolTipMessage,
      closeInfoRoomCard,
      isAdmin,
      cooperateMicState,
      cooperateCameraState,
      cooperateScreenShareState,
      cooperateActionsState,
    };
  },
});
</script>

<style lang="scss">
@import './sharedStreamContent.scss';
</style>
