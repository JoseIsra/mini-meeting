import { ref, reactive } from 'vue';
import { HandNotification } from '@/types/datachannelMessages';

//export * from './actions';
export * from './participants';
export * from './userMe';
export * from './room';

export * from './auth';
/* export * from './mainView'; */
export * from './chat';
export * from './external-video';
export * from './screen';
export * from './streams';

export * from './antMediaMerge';

interface FunctionState {
  renderChat: boolean;
  renderNotes: boolean;
  renderUsersList: boolean;
  handNotificationActive: boolean;
  handNotificationInfo: HandNotification[];
  selectedButtonID: string;
  renderPopupMenu: boolean;
  renderResponsiveFunctionMenu: boolean;
}

interface PerifericsState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenShared: boolean;
  cameraId: string;
  isVideoActivated: boolean;
}

export interface FullScreenContent<T> {
  content: T;
}

const functionState = {
  renderChat: false,
  renderNotes: false,
  renderUsersList: false,
  handNotificationActive: false,
  handNotificationInfo: [] as HandNotification[],
  selectedButtonID: '',
  renderPopupMenu: false,
  renderResponsiveFunctionMenu: false,
};

const perifericsState = {
  isMicOn: true,
  isCameraOn: false,
  isScreenShared: false,
  cameraId: '',
  isVideoActivated: false,
};

const isSidebarRender = ref<boolean>(false);
const showParticipantPanel = ref<boolean>(false);

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
  const addHandNotificationInfo = (value: HandNotification) => {
    functionsOnMenuBar.handNotificationInfo.push(value);
  };

  const removeHandNotification = (value: string) => {
    functionsOnMenuBar.handNotificationInfo =
      functionsOnMenuBar.handNotificationInfo.filter(
        (notific) => notific.from !== value
      );
  };

  const openOptionsMenu = (value: boolean) => {
    functionsOnMenuBar.renderPopupMenu = value;
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
    openOptionsMenu,
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
    perifericsControl.cameraId = value;
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

  const toggleParticipantPanel = () =>
    (showParticipantPanel.value = !showParticipantPanel.value);

  return {
    isSidebarRender,
    setSidebarState,
    showParticipantPanel,
    toggleParticipantPanel,
  };
}
