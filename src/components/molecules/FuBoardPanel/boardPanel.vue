<template>
  <div class="m-boardPanel">
    <fieldset class="m-boardPanel__control">
      <legend class="m-boardPanel__control__text --mainTitle">
        Configuracion
      </legend>

      <q-checkbox
        v-model="localBoardState"
        :label="localBoardState ? 'Desactivar pizarra' : 'Activar Pizzara'"
        dense
        dark
        class="m-boardPanel__control__check"
        left-label
        color="primary"
      />

      <!-- :icon=" userMe.micPublishedState == 1 ? iconsPeriferics.mic.onState :
      userMe.micPublishedState == 2 ? iconsPeriferics.mic.loadingState :
      iconsPeriferics.mic.offState " :disable="userMe.isPublishing == 2 ||
      userMe.isMicBlocked" -->

      <!-- loadingState: 'fas fa-spinner', -->
    </fieldset>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRoom } from '@/composables/room';
import { BOARD_EVENTS } from '@/utils/enums';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { useMainView } from '@/composables';
import { MAIN_VIEW_MODE } from '@/utils/enums';

export default defineComponent({
  name: 'FuBoardPanel',
  setup() {
    const { userMe, updateUserMe } = useUserMe();
    const { roomState } = useRoom();
    const { sendData, publish } = useInitWebRTC();

    const { mainViewState, setBoardState } = useMainView();

    const localBoardState = ref<boolean>(
      mainViewState.mode === MAIN_VIEW_MODE.BOARD
    );

    watch(localBoardState, (value: boolean) => {
      if (value) {
        window.xprops?.updateBoardObjects?.('{}');
        setBoardState(true);

        if (userMe.isPublishing == 1) {
          sendData(roomState.hostId, {
            eventType: 'BOARD_EVENT',
            event: BOARD_EVENTS.TURN_ON,
          });
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);
          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              /* setMicIconState(true); */
              sendData(roomState.hostId, {
                eventType: 'BOARD_EVENT',
                event: BOARD_EVENTS.TURN_ON,
              });
            }
          }, 1000);
        }
      } else {
        window.xprops?.updateBoardObjects?.('');
        setBoardState(false);

        if (userMe.isPublishing == 1) {
          sendData(roomState.hostId, {
            eventType: 'BOARD_EVENT',
            event: BOARD_EVENTS.TURN_OFF,
          });
        } else {
          updateUserMe({ isPublishing: 2 });
          publish(userMe.id, undefined, undefined, undefined, userMe.name);
          const interval = setInterval(() => {
            if (userMe.isPublishing == 1) {
              clearInterval(interval);
              /* setMicIconState(true); */
              sendData(roomState.hostId, {
                eventType: 'BOARD_EVENT',
                event: BOARD_EVENTS.TURN_OFF,
              });
            }
          }, 1000);
        }
      }
    });

    return {
      localBoardState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './boardPanel.scss';
</style>
