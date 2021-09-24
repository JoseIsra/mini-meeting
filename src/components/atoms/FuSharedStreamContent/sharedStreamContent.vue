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

      <div class="m-shared__admin" v-show="canModifyActions">
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

          <div class="m-shared__admin__toggle" style="height: 40px">
            <span>
              {{
                actionsActivated
                  ? 'Acciones desbloqueadas'
                  : 'Acciones bloqueadas'
              }}
            </span>

            <q-btn
              :icon="!actionsActivated ? 'fas fa-lock-open' : 'fas fa-lock'"
              @click="handleAllActions"
              flat
              size="10px"
              style="padding: 8px; margin-right: 8px"
            >
              <q-tooltip
                class="bg-grey-10"
                anchor="bottom middle"
                self="top middle"
                transition-show="scale"
                transition-hide="scale"
              >
                <label>{{
                  !actionsActivated
                    ? 'Desbloquear todas las acciones'
                    : 'Bloquear todas las acciones'
                }}</label>
              </q-tooltip>
            </q-btn>

            <!-- <q-toggle
              class="m-shared__admin__toggle"
              v-model="actionsActivated"
              left-label
              :label="
                actionsActivated
                  ? 'Todos estan en true'
                  : 'No estan todos en true'
              "
              :icon="actionsActivated ? 'fas fa-lock-open' : 'fas fa-lock'"
            /> -->
          </div>
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useUserMe } from '@/composables/userMe';
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

    const { userMe } = useUserMe();

    const isMicLcked = window.xprops?.isMicLocked || false;

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = window.xprops?.isScreenShareLocked || false;

    const cooperateMicState = ref(!isMicLcked);

    const cooperateCameraState = ref(!isCameraLocked);

    const cooperateScreenShareState = ref(!isScreenShareLocked);

    const actionsActivated = computed(
      () =>
        cooperateMicState.value &&
        cooperateScreenShareState.value &&
        cooperateCameraState.value
    );

    const canModifyActions = ref(userMe.roleId === 0 || userMe.roleId === 2);

    watch(cooperateMicState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Mic,
        state: Number(value),
      } as lockAction;

      window.xprops?.toggleLockAction?.(lockAction);
    });

    watch(cooperateCameraState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Camera,
        state: Number(value),
      } as lockAction;

      window.xprops?.toggleLockAction?.(lockAction);
    });

    watch(cooperateScreenShareState, (value) => {
      const lockAction = {
        type: LOCK_ACTION_TYPE.Screen,
        state: Number(value),
      } as lockAction;

      window.xprops?.toggleLockAction?.(lockAction);
    });

    watch(
      [cooperateMicState, cooperateCameraState, cooperateScreenShareState],
      ([mic, camera, screenShare]) => {
        if (mic && camera && screenShare) {
          const lockAction = {
            type: LOCK_ACTION_TYPE.All,
            state: 0,
          } as lockAction;

          window.xprops?.toggleLockAction?.(lockAction);
        }

        if (!mic && !camera && !screenShare) {
          const lockAction = {
            type: LOCK_ACTION_TYPE.All,
            state: 1,
          } as lockAction;

          window.xprops?.toggleLockAction?.(lockAction);
        }
      }
    );

    const handleAllActions = () => {
      if (actionsActivated.value) {
        cooperateMicState.value = false;
        cooperateScreenShareState.value = false;
        cooperateCameraState.value = false;
      } else {
        cooperateMicState.value = true;
        cooperateScreenShareState.value = true;
        cooperateCameraState.value = true;
      }
    };

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
      canModifyActions,
      cooperateMicState,
      cooperateCameraState,
      cooperateScreenShareState,
      actionsActivated,
      handleAllActions,
    };
  },
});
</script>

<style lang="scss">
@import './sharedStreamContent.scss';
</style>
