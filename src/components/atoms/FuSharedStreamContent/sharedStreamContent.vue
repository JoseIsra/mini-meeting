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
            label="Microfonos"
            :icon="cooperateMicState ? 'mic' : 'mic_off'"
          />

          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateCameraState"
            left-label
            label="Camaras"
            :icon="cooperateCameraState ? 'videocam' : 'videocam_off'"
          />

          <q-toggle
            class="m-shared__admin__toggle"
            v-model="cooperateScreenShareState"
            left-label
            label="Compartir Pantalla"
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
          </div>
        </div>

        <div class="m-shared__admin__backgroundImage">
          <fu-image-picker />

          <q-checkbox
            style="justify-content: space-between; width: 100%; margin: 8px 0"
            v-model="bgInfo.maximized"
            label="Maximizar fondo de pantalla"
            dense
            dark
            left-label
            color="primary"
          />
        </div>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, toRefs } from 'vue';
import FuImagePicker from '@/components/atoms/FuImagePicker';
import { useUserMe } from '@/composables/userMe';
import { lockAction } from '@/types/index';
import { LOCK_ACTION_TYPE } from '@/utils/enums';
import { useRoom } from '@/composables/room';
import { useInitWebRTC } from '@/composables/antMedia';

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
  components: {
    FuImagePicker,
  },
  setup(props, { emit }) {
    let sharedLinkOnInput = ref(props.sharedLink);

    const { userMe } = useUserMe();

    const { roomState } = useRoom();

    const { sendData } = useInitWebRTC();

    const isMicLocked = window.xprops?.isMicLocked || false;

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = window.xprops?.isScreenShareLocked || false;

    const cooperateMicState = ref(!isMicLocked);

    const cooperateCameraState = ref(!isCameraLocked);

    const cooperateScreenShareState = ref(!isScreenShareLocked);

    const actionsActivated = computed(
      () =>
        cooperateMicState.value &&
        cooperateScreenShareState.value &&
        cooperateCameraState.value
    );

    watch(
      [cooperateMicState, cooperateCameraState, cooperateScreenShareState],
      ([mic, camera, screenShare], [prevMic, prevCamera, prevScreenShare]) => {
        const haveAllChanged =
          prevMic !== mic &&
          camera !== prevCamera &&
          screenShare !== prevScreenShare;

        if (haveAllChanged) {
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
        } else {
          if (mic !== prevMic) {
            const lockAction = {
              type: LOCK_ACTION_TYPE.Mic,
              state: Number(!mic),
            } as lockAction;

            window.xprops?.toggleLockAction?.(lockAction);
          }

          if (camera !== prevCamera) {
            const lockAction = {
              type: LOCK_ACTION_TYPE.Camera,
              state: Number(!camera),
            } as lockAction;

            window.xprops?.toggleLockAction?.(lockAction);
          }

          if (screenShare !== prevScreenShare) {
            const lockAction = {
              type: LOCK_ACTION_TYPE.Screen,
              state: Number(!screenShare),
            } as lockAction;

            window.xprops?.toggleLockAction?.(lockAction);
          }
        }
      }
    );

    const canModifyActions = ref(userMe.roleId === 0);

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

    watch(roomState, (value) => {
      sendData(userMe.id, {
        eventType: 'UPDATE_ROOM_SIZE',
        maximized: value.bgInfo.maximized,
      });

      window.xprops?.setBackgroundInfo?.(
        roomState.bgInfo.url,
        value.bgInfo.maximized
      );
    });

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
      ...toRefs(roomState),
    };
  },
});
</script>

<style lang="scss">
@import './sharedStreamContent.scss';
</style>
