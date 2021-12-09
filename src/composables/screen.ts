import { ref } from 'vue';

// screenState (FALSE > NOT MINIMIZED)
const screenMinimized = ref<boolean>(false);
const isLandscape = ref<boolean>(false);

export const useScreen = () => {
  const updateScreenState = () => {
    screenMinimized.value = !screenMinimized.value;
    window.xprops?.toggleMinimize?.(screenMinimized.value);
  };

  const setScreenDeviceOrientation = (value: boolean) => {
    isLandscape.value = value;
  };

  return {
    screenMinimized,
    updateScreenState,
    setScreenDeviceOrientation,
    isLandscape,
  };
};
