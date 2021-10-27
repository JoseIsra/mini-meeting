<template>
  <div class="o-cooperate-board" v-show="showBoard">
    <div class="o-cooperate-board__toolbar">
      <q-btn
        class="o-cooperate-board__tool"
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
        class="o-cooperate-board__tool"
        icon="fas fa-pencil-alt"
        @click="toggleDrawMode"
        size="8px"
        dense
      />
      <q-btn
        class="o-cooperate-board__tool"
        icon="fas fa-eraser"
        @click="callCleanBoard"
        size="8px"
        dense
      />
      <q-btn
        class="o-cooperate-board__tool"
        icon="fas fa-democrat"
        @click="dummylogs"
        size="8px"
        dense
      />
      <q-btn
        class="o-cooperate-board__tool"
        icon="fas fa-square"
        @click="addRect"
        size="8px"
        dense
      />
    </div>
    <div class="o-cooperate-board__board">
      <canvas id="board" width="750" height="500"></canvas>
    </div>
  </div>
  <div
    v-show="!showBoard"
    class="o-cooperate-activeBoard"
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

import { defineComponent, onMounted } from 'vue';
import { useBoard } from '@/composables/board';
import { fabric } from 'fabric';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';
import { BOARD_EVENTS } from '@/utils/enums';

export default defineComponent({
  name: 'FuBoard',
  setup() {
    const {
      board,
      showBoard,
      setBoard,
      toggleShowBoard,
      clearBoard,
      dummylogs,
    } = useBoard();

    // const context = ref(null);

    const { sendData } = useInitWebRTC();

    const { userMe } = useUserMe();

    onMounted(() => {
      setBoard(new fabric.Canvas('board'));
      board.value.isDrawingMode = true;

      // context.value = canvasref.value.getContext('2d');
      // canvasref.value.addEventListener(
      //   'object:added',
      //   (value) => {
      //     console.log(value);
      //   },
      //   false
      // );
      // context.value = canvas.getContext('2d');
      // console.log(context.value);
      // canvasRef.value.setDimensions({width: 750, height:  500});
      // canvasRef.value?.backgroundColor  = '#fff';
      // const canvasProperties = {width:750, height:500}
      // const currentCanvas = {json: JSON.parse(canvasRef.value), canvas: canvasProperties};
      // new CanvasHistory(canvasRef.value, currentCanvas);

      board.value.on('object:added', (options) => {
        const obj = options.target;

        console.log(obj);

        if (obj) {
          if (!obj.id) {
            console.log('Objeto nuevo sin id');
            console.log('Object id: ', obj.id);
            obj.set('id', Date.now().toString() + '-' + userMe.id);
            obj.toJSON = (function (toJSON) {
              return function () {
                return fabric.util.object.extend(toJSON.call(this), {
                  id: this.id,
                });
              };
            })(obj.toJSON);

            sendData(userMe.id, {
              eventType: 'BOARD_EVENT',
              event: BOARD_EVENTS.ADD,
              object: JSON.stringify(obj),
            });
          }
        }

        console.debug(board.value.getObjects());
        
        window.xprops?.updateBoardObjects?.(
          JSON.stringify(board.value.getObjects())
        );
      });

      board.value.on('object:modified', (options) => {
        console.log('Update: ', options);
      });

      board.value.on('object:removed', (options) => {
        console.log('Removed: ', options);
      });
    });

    const toggleDrawMode = () =>
      (board.value.isDrawingMode = !board.value.isDrawingMode);

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
      sendData(userMe.id, {
        eventType: 'BOARD_EVENT',
        event: BOARD_EVENTS.CLEAN,
      });
    };

    return {
      toggleDrawMode,
      callCleanBoard,
      showBoard,
      toggleShowBoard,
      dummylogs,
      addRect,
    };
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
