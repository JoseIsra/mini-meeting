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
  };

  const addObject = (object) => {
    console.log('Add object board js: ', object);

    if (object.type == 'rect') {
      console.log('You added a rectangle!');
      board.value.add(new fabric.Rect(object));
    } else if (object.type === 'path') {
      console.log('You added a path');
      board.value.add(new fabric.Path(object));
    }
  };

  const getObjectFromId = (id) => {
    const currentObjects = board.value.getObjects();

    for (let i = currentObjects.length - 1; i >= 0; i--) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (obj) => {
    console.log(obj);

    const test = board.value
      .getObjects()
      .find((object) => object.id === obj.id);

    console.log('Metodo EcmaScript: ', test);

    const existing = getObjectFromId(obj.id);

    console.log(existing);

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
        console.log('Nuevo rect');
        board.value.add(new fabric.Rect(obj));
      } else if (obj.type === 'path') {
        console.log('Nuevo path');
        console.log(obj);
        console.log(new fabric.Path(obj));
        board.value.add(new fabric.Rect(obj));
      }
    }
    board.value.renderAll();
  };

  const dummylogs = () => {
    console.log(board.value.getObjects());
  };

  return {
    board,
    setBoard,
    showBoard,
    toggleShowBoard,
    clearBoard,
    dummylogs,
    addObject,
    handleObject,
  };
};
