import { ref, reactive } from 'vue';
import { User } from '@/types/user';
import { HandNotification } from '@/types/datachannelMessages';

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
const isFullScreen = ref<boolean>(false);
const fullScreenMode = ref('');
const fullScreenObject = reactive<User>({} as User);
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

  const setFullScreen = (specificMode: string, state: boolean) => {
    isFullScreen.value = state;
    fullScreenMode.value = specificMode;
  };

  const setFullScreenObject = (value: User) => {
    Object.assign(fullScreenObject, value);
  };
  const clearFullScreenObject = () => {
    Object.keys(fullScreenObject).forEach((key) => {
      delete fullScreenObject[key as keyof User];
    });
  };

  const setIDButtonSelected = (value: string) => {
    functionsOnMenuBar.selectedButtonID = value;
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
    setFullScreen,
    isFullScreen,
    setIDButtonSelected,
    openOptionsMenu,
    openFunctionResponsiveMenu,
    functionState,
    fullScreenMode,
    setFullScreenObject,
    fullScreenObject,
    clearFullScreenObject,
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
