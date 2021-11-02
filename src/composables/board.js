/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ref } from 'vue';
import { fabric } from 'fabric';

const showBoard = ref(true);
const board = ref(null);
export const useBoard = () => {
  const setBoard = (value) => {
    board.value = value;
  };

  const toggleShowBoard = () => {
    showBoard.value = !showBoard.value;
  };

  const clearBoard = () => {
    board.value.clear();
    window.xprops?.updateBoardObjects?.('{}');
  };

  const getObjectFromId = (id) => {
    const currentObjects = board.value.getObjects();

    for (let i = currentObjects.length - 1; i >= 0; i--) {
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (obj) => {
    console.debug(obj);

    const test = board.value
      .getObjects()
      .find((object) => object.id === obj.id);

    console.debug('Metodo EcmaScript: ', test);

    const existing = getObjectFromId(obj.id);

    console.debug(existing);

    if (obj.removed) {
      if (existing) {
        board.value.remove(existing);
      }
      return;
    }

    if (existing) {
      existing.set(obj);
    } else {
      if (obj.type === 'rect') {
        console.debug('Nuevo rect');
        board.value.add(new fabric.Rect(obj));
      } else if (obj.type === 'path') {
        console.debug('Nuevo path');
        console.debug(new fabric.Path(obj));
        // board.value.add(new fabric.Path(obj));
        // board.value.add(new fabric.Line(obj))
        board.value.add(new fabric.Rect(obj));
      } else {
        console.debug('Objecto extraño');        
      }
    }
    board.value.renderAll();
  };

  const dummylogs = () => {
    console.debug(board.value.getObjects());
  };

  const loadBoard = (objects) => {
    console.debug('Board objects: ', objects);
    if (objects.length) {
      objects.forEach((obj) => handleObject(obj));
    }
  };

  return {
    board,
    setBoard,
    showBoard,
    toggleShowBoard,
    clearBoard,
    dummylogs,

    handleObject,
    loadBoard,
  };
};
