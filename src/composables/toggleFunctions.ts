import { reactive, ref } from 'vue';
import { FunctionState, HandNotification } from '@/types';

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

const functionsOnMenuBar = reactive<FunctionState>(functionState);
const isSidebarRender = ref<boolean>(false);
const showParticipantPanel = ref<boolean>(false);

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
