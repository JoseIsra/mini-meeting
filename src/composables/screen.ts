import { ref } from 'vue';
import { ZoidWindow } from '@/types/zoid';

// screenState (FALSE > NOT MINIMIZED)
const screenMinimized = ref<boolean>(false);

export const useScreen = () => {
  const updateScreenState = () => {
    screenMinimized.value = !screenMinimized.value;    
    (window as ZoidWindow).xprops?.handleMinimize?.(screenMinimized.value);
  };
  return {
    screenMinimized,
    updateScreenState,
  };
};
