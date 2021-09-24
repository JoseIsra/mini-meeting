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

    watch(cooperateMicState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Mic,
        state: Number(value),
      } as lockAction;

      (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
    });

    const cooperateCameraState = ref(!isCameraLocked);

    watch(cooperateCameraState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Camera,
        state: Number(value),
      } as lockAction;

      (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
    });

    const cooperateScreenShareState = ref(!isScreenShareLocked);

    watch(cooperateScreenShareState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Screen,
        state: Number(value),
      } as lockAction;

      (window as ZoidWindow)?.xprops?.toggleLockAction?.(lockAction);
    });

    watch(
      [cooperateMicState, cooperateCameraState, cooperateScreenShareState],
      () => {
        const lockAction = {
          type: LOCK_ACTION_TYPE.Screen,
        } as lockAction;

        if (
          cooperateMicState.value &&
          cooperateCameraState.value &&
          cooperateScreenShareState.value
        ) {
          console.log('Los 3 habilitados');

          (window as ZoidWindow)?.xprops?.toggleLockAction?.({
            ...lockAction,
            state: 0,
          });
        } else if (
          !cooperateMicState.value &&
          !cooperateCameraState.value &&
          !cooperateScreenShareState.value
        ) {
          console.log('Los 3 deshabilitados');

          (window as ZoidWindow)?.xprops?.toggleLockAction?.({
            ...lockAction,
            state: 1,
          });
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
    };
  },
});
</script>

<style lang="scss">
@import './sharedStreamContent.scss';
</style>
