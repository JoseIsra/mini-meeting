import { ref, reactive } from 'vue';
//import { ZoidWindow } from '@/types/zoid';

interface FunctionState {
  renderChat: boolean;
  renderNotes: boolean;
  renderUsersList: boolean;
  handNotificationActive: boolean;
  handNotificationInfo: HandNotification;
}

interface PerifericsState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenShared: boolean;
  cameraDeviceId: string;
  isVideoActivated: boolean;
}

export interface HandNotification {
  streamId: string;
  streamName: string;
  eventType: string;
}

const functionState = {
  renderChat: false,
  renderNotes: false,
  renderUsersList: false,
  handNotificationActive: false,
  handNotificationInfo: {} as HandNotification,
};

const perifericsState = {
  isMicOn: true,
  isCameraOn: false,
  isScreenShared: false,
  cameraDeviceId: '',
  isVideoActivated: false,
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

  const updateHandNotification = (value: boolean) => {
    functionsOnMenuBar.handNotificationActive = value;
  };
  const setHandNotificationInfo = (value: HandNotification) => {
    Object.assign(functionsOnMenuBar.handNotificationInfo, value);
  };

  return {
    functionsOnMenuBar,
    setShowChat,
    setShowNotes,
    setShowUsersList,
    updateHandNotification,
    setHandNotificationInfo,
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

  const setVideoActivatedState = (value: boolean) => {
    perifericsControl.isVideoActivated = value;
  };

  return {
    perifericsControl,
    setMicState,
    setCameraState,
    setScreenState,
    setCameraDevice,
    setVideoActivatedState
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
