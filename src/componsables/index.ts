import { ref, reactive } from 'vue';

interface FunctionState {
  renderChat: boolean;
  renderNotes: boolean;
  renderUsersList: boolean;
}

interface PerifericsState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenShared: boolean;
  cameraDeviceId: string;
}

const functionState = {
  renderChat: false,
  renderNotes: false,
  renderUsersList: false,
};

const perifericsState = {
  isMicOn: false,
  isCameraOn: false,
  isScreenShared: false,
  cameraDeviceId: '',
};

const isSidebarRender = ref<boolean>(false);
const functionsOnMenuBar = reactive<FunctionState>(functionState);
const perifericsControl = reactive<PerifericsState>(perifericsState);

export function useToogleFunctions() {
  const setShowChat = (value: boolean) => {
    functionsOnMenuBar.renderChat = value;
  };
  const setShowNotes = (value: boolean) => {
    functionsOnMenuBar.renderNotes = value;
  };
  const setShowUsersList = (value: boolean) => {
    functionsOnMenuBar.renderUsersList = value;
  };
  return {
    functionsOnMenuBar,
    setShowChat,
    setShowNotes,
    setShowUsersList,
  };
}

export function usePerifericsControls() {
  const setMicState = (value: boolean) => {
    perifericsControl.isMicOn = value;
  };
  const setCameraState = (value: boolean) => {
    perifericsControl.isCameraOn = value;
  };

  const setScreenState = (value: boolean) => {
    perifericsControl.isScreenShared = value;
  };

  const setCameraDevice = (value: string) => {
    perifericsControl.cameraDeviceId = value;
  };

  return {
    perifericsControl,
    setMicState,
    setCameraState,
    setScreenState,
    setCameraDevice,
  };
}

export function useSidebarToogle() {
  const setSidebarState = (value: boolean) => {
    isSidebarRender.value = value;
  };
  return {
    isSidebarRender,
    setSidebarState,
  };
}
