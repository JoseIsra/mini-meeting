<template>
  <div class="o-board" v-show="showBoard">
    <div class="o-board__mask" v-if="!canDraw && roleId === 1"></div>

    <div class="o-board__toolbar">
      <q-btn
        class="o-board__toolbar__tool"
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
        class="o-board__toolbar__tool"
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
        class="o-board__toolbar__tool"
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
        class="o-board__toolbar__tool"
        icon="fas fa-democrat"
        @click="dummylogs"
        size="8px"
        dense
      />
      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-square"
        @click="addRect"
        size="8px"
        dense
        :disable="!canDraw"
      />
      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-circle"
        @click="addCircle"
        size="8px"
        dense
        :disable="!canDraw"
      />
      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-brush"
        @click="toggleBrushSizeShow"
        size="8px"
        dense
        :disable="!canDraw"
      />
      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-dummy"
        :style="`background-color: ${brushColor}`"
        size="8px"
        dense
        :disable="!canDraw"
        @click="toggleBrushPicker"
      >
        <q-tooltip class="bg-grey-10">
          <label> Color principal</label>
        </q-tooltip>
      </q-btn>
      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-dummy"
        :style="`background-color: ${strokeColor}`"
        size="8px"
        dense
        :disable="!canDraw"
        @click="toggleStrokePicker"
      >
        <q-tooltip class="bg-grey-10">
          <label> Color Borde</label>
        </q-tooltip>
      </q-btn>

      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-dummy"
        :style="`background-color: ${bgColor}`"
        size="8px"
        dense
        :disable="!canDraw"
        @click="toggleBgPicker"
      >
        <q-tooltip class="bg-grey-10">
          <label> Color del lienzo</label>
        </q-tooltip>
      </q-btn>
    </div>

    <div class="o-board__board">
      <canvas id="board" width="750" height="500"></canvas>
    </div>

    <div class="o-board__tools">
      <q-color v-show="showBrushPicker" v-model="brushColor" />
      <q-color v-show="showStrokePicker" v-model="strokeColor" />
      <q-color v-show="showBgPicker" v-model="bgColor" />
      <div class="o-board__tools__brush" v-show="brushSizeShow">
        <q-avatar
          class="o-board__tools__brush__label"
          color="blue"
          text-color="white"
        >
          {{ brushSize }}</q-avatar
        >
        <q-slider
          class="o-board__tools__brush__size"
          v-model="brushSize"
          :min="1"
          :max="100"
        />
      </div>
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
    const brushSizeShow = ref(false);

    const brushColor = ref('#000000');
    const strokeColor = ref('#000000');
    const fillColor = ref('#ffffff');
    const bgColor = ref('#ffffff');
    const textEditColor = ref('#000000');
    const brushSize = ref(1);
    const strokeSize = ref(4);
    const eraserSize = ref(4);
    const fontSize = ref(18);

    const showBgPicker = ref(false);
    const showBrushPicker = ref(false);
    const showStrokePicker = ref(false);

    const {
      board,
      showBoard,
      loadBoard,
      setBoard,
      toggleShowBoard,
      clearBoard,
      dummylogs,
      changeBgColor,
    } = useBoard();

    watch(brushSize, (value) => {
      if (board) {
        console.debug(value);
        board.value.freeDrawingBrush.width = value;
      }
    });

    watch(brushColor, (value) => {
      if (board) {
        board.value.freeDrawingBrush.color = value;
      }
    });

    watch(strokeColor, (value) => {
      if (board) {
        console.debug(value);
        // board.value.strokeStyle.color = value;
      }
    });

    watch(bgColor, (value) => {
      if (board) {
        changeBgColor(value);
        // sendData(roomState.hostId, {
        //   eventType: 'BOARD_EVENT',
        //   from: userMe.id,
        //   to: 'ALL',
        //   event: BOARD_EVENTS.CHANGE_BG_COLOR,
        //   color: value
        // });
      }
    });

    const { sendData } = useInitWebRTC();

    const { userMe } = useUserMe();

    const { roomState } = useRoom();

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
        width: 100,
        height: 100,
        objectCaching: false,
      });

      if (board.value.isDrawingMode) {
        toggleDrawMode();
      }

      board.value.add(rect);
      board.value.setActiveObject(rect);
    };

    const addCircle = () => {
      const circle = new fabric.Circle({ radius: 75, fill: 'blue' });

      if (board.value.isDrawingMode) {
        toggleDrawMode();
      }

      board.value.add(circle);
      board.value.setActiveObject(circle);
    };

    const callCleanBoard = () => {
      brushColor.value = '#000000';
      strokeColor.value = '#000000';
      fillColor.value = '#ffffff';
      bgColor.value = '#ffffff';
      textEditColor.value = '#000000';
      brushSize.value = 1;
      strokeSize.value = 4;
      eraserSize.value = 4;
      fontSize.value = 18;

      clearBoard();

      sendData(roomState.hostId, {
        eventType: 'BOARD_EVENT',
        event: BOARD_EVENTS.CLEAR,
      });
    };

    const discard = () => {
      board.value.discardActiveObject();
      board.value.requestRenderAll();
    };

    const handleColorBrush = (color) => {
      const brush = board.value.freeDrawingBrush;
      brush.color = color;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    };

    // const deleteObject = (eventData, transform) => {
    //   const target = transform.target;
    //   const canvas = target.canvas;
    //   canvas.remove(target);
    //   canvas.requestRenderAll();
    // };

    onMounted(() => {
      setBoard(new fabric.Canvas('board'));

      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = 'blue';
      fabric.Object.prototype.cornerStyle = 'circle';

      if (userMe.roleId !== 1) {
        board.value.isDrawingMode = true;
        actionSelected.value = 'draw';
      }

      const boardObjects = window?.xprops?.boardObjects || '';

      if (boardObjects) {
        loadBoard(boardObjects);
      }

      board.value.on({
        'object:added': (options) => {
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

              // sendData(roomState.hostId, {
              //   eventType: 'BOARD_EVENT',
              //   from: userMe.id,
              //   to: 'ALL',
              //   event: BOARD_EVENTS.ADD,
              //   object: JSON.stringify(obj),
              //   canvas: JSON.stringify(board.value),
              // });

              window.xprops?.updateBoardObjects?.(JSON.stringify(board.value)); // update cooperate-options field
            }
          }
        },
        'object:modified': (options) => {
          console.log('Modified: ', options);
        },
        'object:removed': (options) => {
          console.log('Removed: ', options);
        },
        'mouse:down': (options) => {
          if (brushSizeShow.value) {
            brushSizeShow.value = false;
          }

          if (options.target) {
            console.debug('You selected an object');
          } else {
            console.debug('Just a click on the board');

            // Not object click
            // Just click on the board

            // Feat: New text, close pop-ups as stroke width, color or size, new rect or circle or even an image if option is selected
          }
        },
      });
    });

    return {
      toggleDrawMode,
      callCleanBoard,
      showBoard,
      toggleShowBoard,
      dummylogs,
      addRect,
      addCircle,
      actionSelected,
      ...toRefs(userMe),
      discard,
      brushColor,
      strokeColor,
      fillColor,
      bgColor,
      textEditColor,
      brushSize,
      strokeSize,
      eraserSize,
      fontSize,
      brushSizeShow,
      toggleBrushSizeShow: () => (brushSizeShow.value = !brushSizeShow.value),
      handleColorBrush,
      showBgPicker,
      toggleBgPicker: () => {
        showBgPicker.value = !showBgPicker.value;
        if (showBrushPicker.value) {
          showBrushPicker.value = !showBrushPicker.value;
        }
        if (showStrokePicker.value) {
          showStrokePicker.value = !showStrokePicker.value;
        }
      },
      showBrushPicker,
      toggleBrushPicker: () => {
        showBrushPicker.value = !showBrushPicker.value;
        if (showBgPicker.value) {
          showBgPicker.value = !showBgPicker.value;
        }
        if (showStrokePicker.value) {
          showStrokePicker.value = !showStrokePicker.value;
        }
      },
      showStrokePicker,
      toggleStrokePicker: () => {
        showStrokePicker.value = !showStrokePicker.value;
        if (showBgPicker.value) {
          showBgPicker.value = !showBgPicker.value;
        }
        if (showBrushPicker.value) {
          showBrushPicker.value = !showBrushPicker.value;
        }
      },
    };
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
