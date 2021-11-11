/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// import { Board } from '@/types/board';

import { ref } from 'vue';
import { fabric } from 'fabric';
import { useRoom } from '.';

const { roomState } = useRoom();

// const showBoard = ref<boolean>(true);
const showBoard = ref(true);
// const board = ref<null | Board>(null);
const board = ref(null);
// const bgColor = ref<string>('#ffffff');
const bgColor = ref('#ffffff');
// const checkSUM = ref<number>(0);
const checkSum = ref(0);
// const objectActive = ref<boolean>(false);
const objectActive = ref(false);

export function useBoard() {
  const setBoard = (value) => {
    board.value = value;
  };

  const toggleShowBoard = () => {
    showBoard.value = !showBoard.value;
  };

  const clearBoard = () => {
    board.value.clear();
    bgColor.value = '#ffffff';
    window.xprops?.updateBoardObjects?.('{}');
  };

  const changeBgColor = (color) => {
    board.value.backgroundColor = color;
    bgColor.value = color;
    board.value.requestRenderAll();
  };

  const getObjectFromId = (id) => {
    const currentObjects = board.value.getObjects();
    for (let i = currentObjects.length - 1; i >= 0; i--) {
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (obj, canvas) => {
    const boardTest = JSON.parse(canvas);
    const existing = getObjectFromId(obj.id);
    if (obj.removed) {
      if (existing) {
        if (objectActive.value) {
          const active = board.value.getActiveObject();
          console.debug(obj.id);
          console.debug(active.id);
          if (active.id === obj.id) {
            setObjectActive(false);
          }
        }

        board.value.remove(existing);
        board.value.requestRenderAll();
      }
      return;
    }
    if (existing) {
      existing.set(obj);
      board.value.requestRenderAll();
    } else {
      console.debug(
        `Agregar objeto recibido: ${obj.id}, tengo ${checkSum.value} objetos`
      );

      if (obj.type === 'path') {
        console.debug('Es un path, to resolve (redibujado):', obj);
        console.debug('Disque mi canvas', boardTest);

        const boardUpdated = {
          ...boardTest,
          objects: boardTest.objects.map((obj, index) => {
            return {
              ...obj,
              id: `${index}-${obj.type}-${roomState.id}`,
            };
          }),
        };

        loadBoard(JSON.stringify(boardUpdated));
      } else if (obj.type === 'rect') {
        console.debug('Es un rect, agregar al board');
        board.value.add(new fabric.Rect(obj));
        checkSumIncrease();
      } else if (obj.type === 'circle') {
        console.debug('Es un circle, agregar al board');
        board.value.add(new fabric.Circle(obj));
        checkSumIncrease();
      } else if (obj.text) {
        console.debug('Es objeto text, agregar al board(redibujado):', obj);
        const boardUpdated = {
          ...boardTest,
          objects: boardTest.objects.map((obj, index) => {
            return {
              ...obj,
              id: `${index}-${obj.type}-${roomState.id}`,
            };
          }),
        };

        loadBoard(JSON.stringify(boardUpdated));
      } else {
        console.debug('Es un objeto de tipo no mapeado aun: ', obj);
      }
    }

    board.value.renderAll();
    // board.value.requestRenderAll();
  };

  const handleMultipleObjects = (canvasObjects) => {
    const { objects, canvas } = canvasObjects;
    const parsedObjects = JSON.parse(objects);

    parsedObjects.forEach((cObject) => {
      console.debug(cObject);
      handleObject(cObject, canvas);
    });
  };
  const dummylogs = () => {
    const objects = board.value.getObjects();
    console.debug(checkSum.value);
    objects.forEach((obj) => console.debug(obj.id));
  };
  const loadBoard = (canvas) => {
    board.value.loadFromJSON(canvas, board.value.renderAll.bind(board.value));
    bgColor.value = canvas.background;
  };
  const discardSelection = () => {
    board.value.discardActiveObject();
    board.value.requestRenderAll();
  };

  const checkSumInitialValue = (value) => (checkSum.value = value);
  const checkSumIncrease = () => checkSum.value++;
  const setObjectActive = (value) => (objectActive.value = value);

  return {
    board,
    setBoard,
    showBoard,
    toggleShowBoard,
    clearBoard,
    dummylogs,
    handleObject,
    loadBoard,
    changeBgColor,
    bgColor,
    discardSelection,
    handleMultipleObjects,
    checkSum,
    checkSumInitialValue,
    checkSumIncrease,
    objectActive,
    setObjectActive,
  };
}
