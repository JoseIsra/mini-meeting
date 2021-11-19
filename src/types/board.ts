
export interface Board {
  version?: string;
  objects: Array<BoardObject>;
  backgroundColor?: string;
  clear?: () => void;
  getObjects?: () => void;
  renderAll?: () => void;
  getContext?: () => void;
}

export interface BoardObject{
    id?: string;
}
