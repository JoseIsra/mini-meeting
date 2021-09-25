import { ref } from 'vue';

// screenState (FALSE > NOT MINIMIZED)
const screenMinimized = ref<boolean>(false);

export const useScreen = () => {
  const updateScreenState = () => {
    screenMinimized.value = !screenMinimized.value;
    window.xprops?.toggleMinimize?.(screenMinimized.value);
  };
  return {
    screenMinimized,
    updateScreenState,
  };
};
