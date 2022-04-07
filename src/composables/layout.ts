import { ref } from 'vue';
import { LAYOUT } from '@/utils/enums/general';

const currentLayout = ref(LAYOUT.DEFAULT_LAYOUT);

export function useLayout() {
  const setNewLayout = (newLayout: LAYOUT) => {
    currentLayout.value = newLayout;
  };

  return {
    setNewLayout,
    currentLayout,
  };
}
