import { ref } from 'vue';

// screenState (FALSE > NOT MINIMIZED)
const screenMinimized = ref<boolean>(false);
const isLandscape = ref<boolean>(false);
const goplaying = ref<boolean>(false);

export const useScreen = () => {
  const updateScreenState = () => {
    screenMinimized.value = !screenMinimized.value;
    window.xprops?.toggleMinimize?.(screenMinimized.value);
  };

  const setScreenDeviceOrientation = (value: boolean) => {
    isLandscape.value = value;
  };

  const tricker = (value: boolean) => {
    goplaying.value = value;
  };

  return {
    screenMinimized,
    updateScreenState,
    setScreenDeviceOrientation,
    isLandscape,
    tricker,
    goplaying,
  };
};
