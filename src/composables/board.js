/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// import { Board } from '@/types/board';

import { ref } from 'vue';
// import { fabric } from 'fabric';

// const showBoard = ref<boolean>(true);
const showBoard = ref(true);
// const board = ref<null | Board>(null);
const board = ref(null);
// const bgColor = ref<string>('#ffffff');
const bgColor = ref('#ffffff');


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
    board.value?.renderAll();
  };

  const getObjectFromId = (id) => {
    console.debug('Buscando id: ', id)
    const currentObjects = board.value.getObjects();

    for (let i = currentObjects.length - 1; i >= 0; i--) {
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (object, canvas) => {
    const obj = JSON.parse(object);
    const board = JSON.parse(canvas);
    const existing = getObjectFromId(obj.id);

    if (obj.removed) {
      if (existing) {
        board.value.remove(existing);
      }
      return;
    }

    if (existing) {
      console.debug('Encontre objeto')
      existing.set(obj);
    } else {
      const autorId = obj.id.split('-').slice(-1)[0]; // object autor id

      const boardUpdate = {
        ...board,
        objects: board.objects.map((obj, index) => {
          return {
            ...obj,
            id: obj.id ?? `${index}-${autorId}`, // id added
          };
        }),
      };

      loadBoard(JSON.stringify(boardUpdate));      
    }

    board.value.renderAll();
  };

  const dummylogs = () => {
    console.debug(board.value.getObjects());
    console.debug(board.value.getContext());
  };

  const loadBoard = (canvas) => {
    board.value.loadFromJSON(canvas, board.value.renderAll.bind(board.value));
    console.debug(board.value);
    bgColor.value = canvas.background;
  };

  const discardSelection = () => {
    board.value.discardActiveObject();
    board.value.requestRenderAll();
  }

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
    discardSelection
  };
};
