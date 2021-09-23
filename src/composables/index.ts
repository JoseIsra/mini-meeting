import { ref, reactive } from 'vue';
//import { ZoidWindow } from '@/types/zoid';

interface FunctionState {
  renderChat: boolean;
  renderNotes: boolean;
  renderUsersList: boolean;
  handNotificationActive: boolean;
  handNotificationInfo: HandNotification[];
  selectedButtonID: string;
  renderPopupMenu: boolean;
  renderInfoRoomCard: boolean;
  renderResponsiveFunctionMenu: boolean;
}

interface PerifericsState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenShared: boolean;
  cameraDeviceId: string;
  isVideoActivated: boolean;
}

export interface HandNotification {
  id: string;
  streamId: string;
  streamName: string;
  eventType: string;
}

// const handNotificationsArray = new Set<HandNotification[]>();

const functionState = {
  renderChat: false,
  renderNotes: false,
  renderUsersList: false,
  handNotificationActive: false,
  handNotificationInfo: [] as HandNotification[],
  selectedButtonID: '',
  renderPopupMenu: false,
  renderInfoRoomCard: false,
  renderResponsiveFunctionMenu: false,
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
const isFullScreen = ref<boolean>(false);
// const fullScreenObject = reactive({});
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
  const addHandNotificationInfo = (value: HandNotification) => {
    functionsOnMenuBar.handNotificationInfo.push(value);
  };

  const removeHandNotification = (value: string) => {
    functionsOnMenuBar.handNotificationInfo =
      functionsOnMenuBar.handNotificationInfo.filter(
        (notific) => notific.streamId !== value
      );
  };

  const setFullScreen = (value: boolean) => {
    isFullScreen.value = value;
  };

  const setIDButtonSelected = (value: string) => {
    functionsOnMenuBar.selectedButtonID = value;
  };

  const openOptionsMenu = (value: boolean) => {
    functionsOnMenuBar.renderPopupMenu = value;
  };

  const watchInfoRoomCard = (value: boolean) => {
    functionsOnMenuBar.renderInfoRoomCard = value;
  };

  const openFunctionResponsiveMenu = (value: boolean) => {
    functionsOnMenuBar.renderResponsiveFunctionMenu = value;
  };

  return {
    functionsOnMenuBar,
    setShowChat,
    setShowNotes,
    setShowUsersList,
    updateHandNotification,
    addHandNotificationInfo,
    removeHandNotification,
    setFullScreen,
    isFullScreen,
    setIDButtonSelected,
    openOptionsMenu,
    watchInfoRoomCard,
    openFunctionResponsiveMenu,
    functionState,
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
    setVideoActivatedState,
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
