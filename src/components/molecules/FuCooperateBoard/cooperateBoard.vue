<template>
  <div class="o-board" v-show="showBoard">
    <div class="o-board__mask" v-if="!canDraw && roleId === 1"></div>

    <div class="o-board__toolbar">
      <q-btn
        class="o-board__tool"
        icon="fas fa-window-minimize"
        @click="toggleShowBoard"
        size="8px"
        dense
      >
        <q-tooltip class="bg-grey-10">
          <label> Minimizar</label>
        </q-tooltip>
      </q-btn>
      <q-btn
        class="o-board__tool"
        icon="fas fa-pencil-alt"
        @click="toggleDrawMode"
        :color="actionSelected === 'draw' ? 'blue' : 'red'"
        text-color="white"
        size="8px"
        dense
        :disable="!canDraw"
      >
        <q-tooltip class="bg-grey-10">
          <label v-if="actionSelected === 'draw'"> Lapiz activado</label>
          <label v-else> Lapiz desactivado</label>
        </q-tooltip>
      </q-btn>
      <q-btn
        class="o-board__tool"
        icon="fas fa-eraser"
        @click="callCleanBoard"
        size="8px"
        dense
        :disable="!canDraw"
      >
        <q-tooltip class="bg-grey-10">
          <label> Limpiar pizarra</label>
        </q-tooltip>
      </q-btn>
      <q-btn
        class="o-board__tool"
        icon="fas fa-democrat"
        @click="dummylogs"
        size="8px"
        dense
      />
      <q-btn
        class="o-board__tool"
        icon="fas fa-square"
        @click="addRect"
        size="8px"
        dense
        :disable="!canDraw"
      />
    </div>

    <div class="o-board__board">
      <canvas id="board" width="750" height="500"></canvas>
    </div>
  </div>
  <div
    v-show="!showBoard"
    class="o-board__activeBoard"
    @click="toggleShowBoard"
  >
    <q-icon style="margin-right: 10px" name="fas fa-drafting-compass" />
    Pizarra activa
  </div>
</template>

<script>
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { defineComponent, onMounted, toRefs, ref, watch } from 'vue';
import { useBoard } from '@/composables/board';
import { fabric } from 'fabric';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { BOARD_EVENTS } from '@/utils/enums';
import { useRoom } from '@/composables/room';

export default defineComponent({
  name: 'FuBoard',
  setup() {
    const actionSelected = ref('');

    const {
      board,
      showBoard,
      loadBoard,
      setBoard,
      toggleShowBoard,
      clearBoard,
      dummylogs,
    } = useBoard();

    const { sendData } = useInitWebRTC();

    const { userMe } = useUserMe();

    const { roomState } = useRoom();

    onMounted(() => {
      setBoard(new fabric.Canvas('board'));

      if (userMe.roleId !== 1) {
        board.value.isDrawingMode = true;
        actionSelected.value = 'draw';
      }

      const boardObjects = window?.xprops?.boardObjects || '';

      if (boardObjects) {
        loadBoard(boardObjects);
      }

      board.value.on('object:added', (options) => {
        const obj = options.target;

        if (obj) {
          if (!obj.id) {
            obj.set('id', Date.now().toString() + '-' + userMe.id);
            obj.toJSON = (function (toJSON) {
              return function () {
                return fabric.util.object.extend(toJSON.call(this), {
                  id: this.id,
                });
              };
            })(obj.toJSON);

            sendData(roomState.hostId, {
              eventType: 'BOARD_EVENT',
              from: userMe.id,
              to: 'ALL',
              event: BOARD_EVENTS.ADD,
              object: JSON.stringify(obj),
              canvas: JSON.stringify(board.value),
            });

            window.xprops?.updateBoardObjects?.(JSON.stringify(board.value)); // update cooperate-options field
          }
        }
      });

      board.value.on('object:modified', (options) => {
        console.log('Modified: ', options);
      });

      board.value.on('object:removed', (options) => {
        console.log('Removed: ', options);
      });
    });

    watch(userMe, (value) => {
      if (value.canDraw === false && actionSelected.value === 'draw') {
        actionSelected.value = ''; // update action selected on block-draw user
      }
    });

    const toggleDrawMode = () => {
      board.value.isDrawingMode = !board.value.isDrawingMode;

      if (actionSelected.value === 'draw') {
        actionSelected.value = '';
      } else {
        actionSelected.value = 'draw';
      }
    };

    const addRect = () => {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 20,
        height: 20,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      board.value.add(rect);
    };

    const callCleanBoard = () => {
      clearBoard();
      sendData(roomState.hostId, {
        eventType: 'BOARD_EVENT',
        event: BOARD_EVENTS.CLEAR,
      });
    };

    return {
      toggleDrawMode,
      callCleanBoard,
      showBoard,
      toggleShowBoard,
      dummylogs,
      addRect,
      actionSelected,
      ...toRefs(userMe),
    };
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
