import { ref } from 'vue';
import { fabric } from 'fabric';

interface Board {
  version: string;
  objects: BoardObject[];
  canvas: unknown;
  backgroundColor: string;
  isDrawingMode: boolean;
  loadFromJSON: (canvas: dummyBoard | string, callBack: void) => void;
  clear: () => void;
  getObjects: () => BoardObject[] | null;
  setActiveObject: (object: BoardObject | unknown) => void;
  getActiveObject: () => BoardObject | null;
  discardActiveObject: () => void;
  add: (object: BoardObject | unknown) => void;
  remove: (object: BoardObject) => void;
  renderAll: {    
    bind: (board: Board) => void; // Setter on ts ?
  };
  requestRenderAll: () => void;
  toJSON: () => dummyBoard;
}

// extends fabric.Object
interface BoardObject {
  id: string;
  type: string;
  text?: string;
  removed?: boolean;
  set: (object: BoardObject) => void;
  toGroup: () => void;
  toObject: () => BoardObject;
  toActiveSelection: () => void;
}

interface dummyBoard {
  version: string;
  objects: string;
  canvas: unknown;
  background?: string;
}

const showBoard = ref<boolean>(true);
const board = ref<null | Board>(null);
const bgColor = ref<string>('#ffffff');
const objectActive = ref<boolean>(false);
const actionSelected = ref<string>('');
const brushColor = ref<string>('#000000');

export function useBoard() {
  const setBoard = (value: Board|null) => {
    board.value = value;
  };

  const loadBoard = (canvas: dummyBoard | string) => {
    if (typeof canvas !== 'string') {
      bgColor.value = canvas.background ?? '#ffffff';      
    }
    
    return board.value?.loadFromJSON(canvas, board.value?.renderAll.bind(board.value));    
  };

  const toggleShowBoard = () => {
    showBoard.value = !showBoard.value;
  };

  const clearBoard = () => {
    bgColor.value = '#ffffff';
    board.value?.clear();

    if (board.value) {
      board.value.backgroundColor = bgColor.value;
    }
  };

  const changeBgColor = (color: string) => {
    bgColor.value = color;
    board.value?.requestRenderAll();

    if (board.value) {
      board.value.backgroundColor = bgColor.value;
    }
  };

  const getObjectFromId = (id: string) => {
    const currentObjects = board.value?.getObjects();

    if (currentObjects) {
      for (let i = currentObjects.length - 1; i >= 0; i--) {
        if (currentObjects[i].id === id) return currentObjects[i];
      }
      return null;
    }
    return null;
  };

  const handleObject = (obj: BoardObject) => {
    const existing = getObjectFromId(obj.id);
    console.debug(obj);

    if (obj.removed) {
      if (existing) {
        if (objectActive.value) {
          const active = board.value?.getActiveObject();
          if (active?.id === obj.id) {
            setObjectActive(false);
          }
        }

        board.value?.remove(existing);
        board.value?.requestRenderAll();
      }
      return;
    }
    if (existing) {
      existing.set(obj);
      board.value?.requestRenderAll();
    } else {
      if (obj.type === 'path') {
        console.debug('Es un path, agregar al board', obj);
        fabric.Path.fromObject(obj, (dummy: BoardObject)  => board.value?.add(dummy));
      } else if (obj.type === 'rect') {
        console.debug('Es un rect, agregar al board');
        board.value?.add(new fabric.Rect(obj));
      } else if (obj.type === 'circle') {
        console.debug('Es un circle, agregar al board');
        board.value?.add(new fabric.Circle(obj));
      } else if (obj.text) {
        console.debug('Es objeto text, agregar al board', obj);
        fabric.Textbox.fromObject(obj, (dummy: BoardObject) => board.value?.add(dummy));
      } else {
        console.debug('Es un objeto de tipo no mapeado aun: ', obj);
      }
    }

    // board.value?.renderAll();
    board.value?.requestRenderAll();
  };

  const handleMultipleObjects = (canvasObjects: string) => {
    const parsedObjects = JSON.parse(canvasObjects) as BoardObject[];

    parsedObjects.forEach((cObject) => {
      handleObject(cObject);
    });
  };

  const dummylogs = () => {
    const objects = board.value?.getObjects();
    objects?.forEach((obj) => console.debug(obj.id));
  };

  const discardSelection = () => {
    board.value?.discardActiveObject();
    board.value?.requestRenderAll();
  };

  const setObjectActive = (value: boolean) => (objectActive.value = value);

  const parseCurrentBoard = () => {
    if (board.value) {
      const parsedObjects = board.value?.getObjects()?.map((obj) => {
        const objParsed = obj.toObject();
        return {
          ...objParsed,
          id: obj.id,
        } as BoardObject;
      });

      const parsedBoard = JSON.stringify({
        ...board.value?.toJSON(),
        objects: parsedObjects,
      });

      return parsedBoard;
    }
  };

  const groupObjects = () => {
    if (!board.value?.getActiveObject()) {
      return;
    }
    if (board.value?.getActiveObject()?.type !== 'activeSelection') {
      return;
    }

    board.value?.getActiveObject()?.toGroup();
    board.value.requestRenderAll();
  };

  const ungroupObjects = () => {
    if (!board.value?.getActiveObject()) {
      return;
    }
    if (board.value?.getActiveObject()?.type !== 'group') {
      return;
    }
    board.value.getActiveObject()?.toActiveSelection();
    board.value.requestRenderAll();
  };

  const toggleDrawMode = () => {
    if (board.value) {
      board.value.isDrawingMode = !board.value.isDrawingMode;

      if (actionSelected.value === 'draw') {
        actionSelected.value = '';
      } else {
        actionSelected.value = 'draw';
      }
    }

    return;
   
  };   

  const addCircle = () => {
    const circle = new fabric.Circle({ radius: 75, fill: brushColor.value });

    if (board.value?.isDrawingMode) {
      toggleDrawMode();
    }

    board.value?.add(circle);
    board.value?.setActiveObject(circle);
  };

  const addRect = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: brushColor.value,
      width: 100,
      height: 100,
    });

    if (board.value?.isDrawingMode) {
      toggleDrawMode();
    }

    board.value?.add(rect);
    board.value?.setActiveObject(rect);
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
