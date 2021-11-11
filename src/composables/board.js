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
      console.debug(currentObjects[i].id);
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (object, canvas) => {
    const obj = JSON.parse(object);
    const boardTest = JSON.parse(canvas);
    const existing = getObjectFromId(obj.id);

    console.debug(existing);

    if (obj.removed) {
      if (existing) {
        board.value.remove(existing);
        board.value.requestRenderAll();
      }
      return;
    }

    if (existing) {
      existing.set(obj);
      board.value.requestRenderAll();
    } else {
      console.debug('Agregar al board objeto: ', obj.id);      

      const boardUpdated = {
        ...boardTest,
        objects: boardTest.objects.map((obj, index) => {
          return {
            ...obj,
            id: `${index}-${roomState.id}`
          }
        })
      }  

      if (obj.type === 'path') {
        console.debug('Es un path, to resolve (redibujado):', obj);        
        loadBoard(JSON.stringify(boardUpdated));
      } else if (obj.type === 'rect') {
        console.debug('Es un rect, agregar al board');
        board.value.add(new fabric.Rect(obj));
      } else if (obj.type === 'circle') {
        console.debug('Es un circle, agregar al board');
        board.value.add(new fabric.Circle(obj));
      } else if (obj.text) {
        console.debug('Es objeto text, agregar al board(redibujado):', obj);
        loadBoard(JSON.stringify(boardUpdated));
      } else {
        console.debug('Es un objeto de tipo no mapeado aun: ', obj);
      }
    }

    board.value.renderAll();
    // board.value.requestRenderAll();
  };

  const dummylogs = () => {
    const objects = board.value.getObjects();

    console.debug(objects);
    objects.forEach((obj) => {
      console.debug(`${obj.id} - ${obj.type}`);
    });
  };

  const loadBoard = (canvas) => {
    board.value.loadFromJSON(canvas, board.value.renderAll.bind(board.value));
    bgColor.value = canvas.background;
  };

  const discardSelection = () => {
    board.value.discardActiveObject();
    board.value.requestRenderAll();
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
    changeBgColor,
    bgColor,
    discardSelection,
  };
}
