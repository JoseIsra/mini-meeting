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
        icon="fas fa-font"
        :color="actionSelected === 'text-box' ? 'blue' : 'red'"
        size="8px"
        dense
        @click="addTextBox"
        :disable="!canDraw"
      >
        <q-tooltip class="bg-grey-10">
          <label> Caja de texto </label>
        </q-tooltip>
      </q-btn>

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

      <!-- <q-btn
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
      </q-btn> -->

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

      <q-btn
        class="o-board__toolbar__tool"
        icon="fas fa-trash-alt"
        color="red"
        text-color="white"
        size="8px"
        dense
        :disable="!objectActive"
        @click="deleteActiveObject"
      >
        <q-tooltip class="bg-grey-10">
          <label> Eliminar objeto</label>
        </q-tooltip>
      </q-btn>
    </div>

    <div class="o-board__board">
      <canvas id="board" width="1000" height="600"></canvas>
    </div>

    <div class="o-board__tools">
      <q-color
        class="o-board__colorPicker"
        v-show="showBrushPicker"
        v-model="brushColor"
        @change="handleBrushColor"
      />
      <q-color
        class="o-board__colorPicker"
        v-show="showStrokePicker"
        v-model="strokeColor"
        @change="handleStrokeColor"
      />
      <q-color
        class="o-board__colorPicker"
        v-show="showBgPicker"
        v-model="bgColor"
        @change="handleBgColor"
      />
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
</template>

<script>
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  toRefs,
  ref,
  watch,
} from 'vue';
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
      bgColor,
      discardSelection,
      objectActive,
      setObjectActive,
    } = useBoard();

    watch(brushSize, (value) => {
      if (board.value) {
        board.value.freeDrawingBrush.width = value;
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
        fill: brushColor.value,
        width: 100,
        height: 100,
      });

      if (board.value.isDrawingMode) {
        toggleDrawMode();
      }

      board.value.add(rect);
      board.value.setActiveObject(rect);
    };

    const addCircle = () => {
      const circle = new fabric.Circle({ radius: 75, fill: brushColor.value });

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

    const handleColorBrush = (color) => {
      const brush = board.value.freeDrawingBrush;
      brush.color = color;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    };

    const parseCurrentBoard = () => {
      if (board.value) {
        const parsedObjects = board.value.getObjects().map((obj) => {
          const objParsed = obj.toObject();
          return {
            ...objParsed,
            id: obj.id,
          };
        });

        window.xprops?.updateBoardObjects?.(
          JSON.stringify({
            ...board.value.toJSON(),
            objects: parsedObjects,
          })
        ); // update cooperate-options field

        return;
      }
    };

    // const deleteObject = (eventData, options) => {
    //   console.debug('Call delete object(s)', options);
    //   const object = options.target;
    //   if (object.id) {
    //     const canvas = object.canvas;
    //     canvas.remove(object);
    //     canvas.requestRenderAll();

    //     sendData(roomState.hostId, {
    //       eventType: 'BOARD_EVENT',
    //       from: userMe.id,
    //       to: 'ALL',
    //       event: BOARD_EVENTS.OBJECT_REMOVE,
    //       objects: JSON.stringify([{ ...object, removed: true }]),
    //       canvas: JSON.stringify(board.value),
    //     });

    //     parseCurrentBoard(); // update cooperate-options field
    //     return;
    //   }

    //   object._objects.forEach((obj) => {
    //     console.debug(obj);
    //     const canvas = obj.canvas;
    //     canvas.remove(obj);
    //     canvas.requestRenderAll();
    //   });

    //   setObjectActive(false);
    //   discardSelection();

    //   sendData(roomState.hostId, {
    //     eventType: 'BOARD_EVENT',
    //     from: userMe.id,
    //     to: 'ALL',
    //     event: BOARD_EVENTS.OBJECT_REMOVE,
    //     objects: JSON.stringify(
    //       object._objects.map((obj) => ({ ...obj, removed: true }))
    //     ),
    //     canvas: JSON.stringify(board.value),
    //   });

    //   window.xprops?.updateBoardObjects?.(JSON.stringify(board.value)); // update cooperate-options field
    // };

    const deleteActiveObject = () => {
      const object = board.value.getActiveObject();
      if (object) {
        if (object.id) {
          const canvas = object.canvas;
          canvas.remove(object);
          canvas.requestRenderAll();
          setObjectActive(false);
          discardSelection();

          const objectHelper = object.toObject();

          sendData(roomState.hostId, {
            eventType: 'BOARD_EVENT',
            from: userMe.id,
            to: 'ALL',
            event: BOARD_EVENTS.OBJECT_REMOVE,
            objects: JSON.stringify([
              { ...objectHelper, id: object.id, removed: true },
            ]),
          });

          parseCurrentBoard(); // update cooperate-options field
          return;
        }
      }
    };

    const groupObjects = () => {
      if (!board.value.getActiveObject()) {
        return;
      }
      if (board.value.getActiveObject().type !== 'activeSelection') {
        return;
      }
      board.value.getActiveObject().toGroup();
      board.value.requestRenderAll();
    };

    onMounted(() => {
      const boardObjects = window?.xprops?.boardObjects || ''; // This should be a call to prop.objects (boardObjects)
      setBoard(new fabric.Canvas('board', { backgroundColor: '#ffffff' }));
      // fabric.Object.prototype.transparentCorners = false;
      // fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      //   x: 0.5,
      //   y: -0.5,
      //   offsetY: -16,
      //   offsetX: 16,
      //   cursorStyle: 'pointer',
      //   mouseUpHandler: deleteObject,
      //   cornerSize: 21,
      // });

      if (userMe.roleId !== 1) {
        board.value.isDrawingMode = true;
        actionSelected.value = 'draw';
      }

      if (boardObjects) {
        if (boardObjects.objects) {
          loadBoard(boardObjects);
        }
      }

      board.value.on({
        'object:added': (options) => {
          const obj = options.target;

          if (options.target.type === 'path') {
            return;
          }

          if (obj) {
            if (!obj.id) {
              obj.set('id', `${Date.now().toString()}-${userMe.id}`);
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
                event: BOARD_EVENTS.OBJECT_ADD,
                objects: JSON.stringify([obj]),
              });
              parseCurrentBoard(); // update cooperate-options field
            }
          }
        },
        'object:modified': (options) => {
          const obj = options.target;
          console.debug('Modified', obj);

          if (obj.type === 'activeSelection') {
            console.debug('ActiveSelection:');
            const dummyObjects = obj._objects.map((objT) => {
              const dummyObject = JSON.stringify(objT);
              const dummyParse = {
                ...JSON.parse(dummyObject),
                id: objT.id,
              };

              return dummyParse;
            });

            console.debug(dummyObjects);

            // sendData(roomState.hostId, {
            //   eventType: 'BOARD_EVENT',
            //   from: userMe.id,
            //   to: 'ALL',
            //   event: BOARD_EVENTS.OBJECT_UPDATE,
            //   objects: JSON.stringify(dummyObjects),
            // });

            return;
          }

          console.debug('Object modified');

          const parsedObject = obj.toObject();

          sendData(roomState.hostId, {
            eventType: 'BOARD_EVENT',
            from: userMe.id,
            to: 'ALL',
            event: BOARD_EVENTS.OBJECT_UPDATE,
            objects: JSON.stringify([
              {
                ...parsedObject,
                id: obj.id,
              },
            ]),
          });

          parseCurrentBoard();
        },
        'mouse:down': (options) => {
          // Close tools on click-board ?
          brushSizeShow.value = false;
          showBgPicker.value = false;
          showBrushPicker.value = false;
          showStrokePicker.value = false;

          if (options.target) {
            const obj = options.target;
            setObjectActive(true);
            if (obj.text) {
              console.debug("It's a text");
            } else if (obj.type === 'path') {
              console.debug("It's a path");
            } else if (obj.type === 'rect') {
              console.debug("It's a rect");
            } else if (obj.type === 'circle') {
              console.debug("It's a circle");
            } else {
              console.debug("It's a: ", obj.type);
            }
          } else {
            console.debug('Just a click on the board');
            setObjectActive(false);
            if (actionSelected.value === 'text-box') {
              const textBox = new fabric.Textbox('Inserte texto', {
                width: 200,
                top: 5,
                left: 5,
                fontSize: 16,
                textAlign: 'center',
              });

              if (board.value.isDrawingMode) {
                board.value.isDrawingMode = false;
              }
              board.value.add(textBox);
              board.value.setActiveObject(textBox);

              actionSelected.value = '';
            }
          }
        },
        'path:created': (options) => {
          const path = options.path;

          if (path) {
            if (!path.id) {
              path.set('id', `${Date.now().toString()}-${userMe.id}`);
              path.toJSON = (function (toJSON) {
                return function () {
                  return fabric.util.object.extend(toJSON.call(this), {
                    id: this.id,
                  });
                };
              })(path.toJSON);

              sendData(roomState.hostId, {
                eventType: 'BOARD_EVENT',
                from: userMe.id,
                to: 'ALL',
                event: BOARD_EVENTS.OBJECT_ADD,
                objects: JSON.stringify([path]),
              });

              parseCurrentBoard(); // update cooperate-options field
            }
          }
        },
      });

      window.addEventListener('keypress', (e) => {
        if (e.key === 'Delete') {
          deleteActiveObject();
        }
      });
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keypress');
    });

    return {
      ...toRefs(userMe),
      toggleDrawMode,
      callCleanBoard,
      showBoard,
      toggleShowBoard,
      dummylogs,
      addRect,
      addCircle,
      actionSelected,
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
      discardSelection,
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
      handleBrushColor: (value) => {
        if (board) {
          board.value.freeDrawingBrush.color = value;
        }
      },
      handleStrokeColor: (value) => {
        if (board) {
          console.debug(value);
          // board.value.strokeStyle.color = value;
        }
      },
      handleBgColor: (value) => {
        if (board) {
          changeBgColor(value);
          sendData(roomState.hostId, {
            eventType: 'BOARD_EVENT',
            from: userMe.id,
            to: 'ALL',
            event: BOARD_EVENTS.CHANGE_BG_COLOR,
            color: value,
          });
        }
      },
      addTextBox: () => {
        if (actionSelected.value === 'draw') {
          toggleDrawMode();
        }
        actionSelected.value = 'text-box';
      },
      deleteActiveObject,
      objectActive,
      groupObjects,
    };
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
