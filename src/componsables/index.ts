import { ref, reactive } from 'vue';

const theobject = {
  thechat: false,
  thenotes: false,
};

// const renderChat = ref<boolean>(false);
const isSidebarRender = ref<boolean>(false);
const renderNotes = ref<boolean>(false);
const functionsOnMenuBar = reactive(theobject);

export function useChatToogle() {
  const setShowChat = (value: boolean) => {
    // renderChat.value = value;
    functionsOnMenuBar.thechat = value;
  };
  return {
    functionsOnMenuBar,
    setShowChat,
  };
}

export function useNotesToogle() {
  const setShowNotes = (value: boolean) => {
    renderNotes.value = value;
  };
  return {
    renderNotes,
    setShowNotes,
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
