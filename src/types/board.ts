// import { Canvas, Object } from 'fabric/fabric-impl';

export interface Board{
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
  freeDrawingBrush: {
    width: number,
    color: string,
    getPatternSrc: {
      call: (brush: unknown) => string
    }
    source: string;
  }
}

// extends fabric.Object
export interface BoardObject{
  id: string;
  type: string;
  text?: string;
  removed?: boolean;
  // canvas: Board;
  set: (object: BoardObject) => void;
  toGroup: () => void;
  toObject: () => BoardObject;
  toActiveSelection: () => void;
}

export interface dummyBoard {
  version: string;
  objects: string;
  canvas: unknown;
  background?: string;
}