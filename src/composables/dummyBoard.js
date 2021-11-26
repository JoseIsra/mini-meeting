/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// import { Board } from '@/types/board';

import { ref } from 'vue';
import { fabric } from 'fabric';

// const showBoard = ref<boolean>(true);
const showBoard = ref(true);
// const board = ref<null | Board>(null);
const board = ref(null);
// const bgColor = ref<string>('#ffffff');
const bgColor = ref('#ffffff');
// const objectActive = ref<boolean>(false);
const objectActive = ref(false);
const actionSelected = ref('');
const brushColor = ref('#000000');


export function useBoard() {
  const setBoard = (value) => {
    board.value = value;
  };

  const loadBoard = (canvas) => {
    board.value.loadFromJSON(canvas, board.value.renderAll.bind(board.value));
    bgColor.value = canvas.background;
  };

  const toggleShowBoard = () => {
    showBoard.value = !showBoard.value;
  };

  const clearBoard = () => {
    board.value.clear();
    bgColor.value = '#ffffff';
    board.value.backgroundColor = bgColor.value;
  };

  const changeBgColor = (color) => {
    bgColor.value = color;
    board.value.backgroundColor = bgColor.value;
    board.value.requestRenderAll();
  };

  const getObjectFromId = (id) => {
    const currentObjects = board.value.getObjects();
    for (let i = currentObjects.length - 1; i >= 0; i--) {
      if (currentObjects[i].id === id) return currentObjects[i];
    }
    return null;
  };

  const handleObject = (obj) => {
    const existing = getObjectFromId(obj.id);
    console.debug(obj);

    if (obj.removed) {
      if (existing) {
        if (objectActive.value) {
          const active = board.value.getActiveObject();
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
      if (obj.type === 'path') {
        console.debug('Es un path, agregar al board', obj);
        new fabric.Path.fromObject(obj, (dummy) => board.value.add(dummy));
      } else if (obj.type === 'rect') {
        console.debug('Es un rect, agregar al board');
        board.value.add(new fabric.Rect(obj));
      } else if (obj.type === 'circle') {
        console.debug('Es un circle, agregar al board');
        board.value.add(new fabric.Circle(obj));
      } else if (obj.text) {
        console.debug('Es objeto text, agregar al board', obj);
        new fabric.Textbox.fromObject(obj, (dummy) => board.value.add(dummy));
      } else {
        console.debug('Es un objeto de tipo no mapeado aun: ', obj);
      }
    }

    board.value.renderAll();
  };

  const handleMultipleObjects = (canvasObjects) => {
    const { objects, canvas } = canvasObjects;
    const parsedObjects = JSON.parse(objects);

    parsedObjects.forEach((cObject) => {
      handleObject(cObject, canvas);
    });
  };

  const dummylogs = () => {
    const objects = board.value.getObjects();
    objects.forEach((obj) => console.debug(obj.id));
  };

  const discardSelection = () => {
    board.value.discardActiveObject();
    board.value.requestRenderAll();
  };

  const setObjectActive = (value) => (objectActive.value = value);

  const parseCurrentBoard = () => {
    if (board.value) {
      const parsedObjects = board.value.getObjects().map((obj) => {
        const objParsed = obj.toObject();
        return {
          ...objParsed,
          id: obj.id,
        };
      });

      const parsedBoard = JSON.stringify({
        ...board.value.toJSON(),
        objects: parsedObjects,
      });

      return parsedBoard;
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

  const ungroupObjects = () => {
    if (!board.value.getActiveObject()) {
      return;
    }
    if (board.value.getActiveObject().type !== 'group') {
      return;
    }
    board.value.getActiveObject().toActiveSelection();
    board.value.requestRenderAll();
  };

  const toggleDrawMode = () => {
    board.value.isDrawingMode = !board.value.isDrawingMode;

    if (actionSelected.value === 'draw') {
      actionSelected.value = '';
    } else {
      actionSelected.value = 'draw';
    }
  };   

  const addCircle = () => {
    const circle = new fabric.Circle({ radius: 75, fill: brushColor.value });

    if (board.value.isDrawingMode) {
      toggleDrawMode();
    }

    board.value.add(circle);
    board.value.setActiveObject(circle);
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
    objectActive,
    setObjectActive,
    parseCurrentBoard,
    groupObjects,
    ungroupObjects,
    toggleDrawMode,
    addCircle,
    addRect,
    actionSelected,
    brushColor
  };
}
