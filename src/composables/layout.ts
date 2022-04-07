import { ref } from 'vue';
import { LAYOUT } from '@/utils/enums/general';

const layout = ref(LAYOUT.DEFAULT_LAYOUT);

export function useLayout() {
  const setNewLayout = (newLayout: LAYOUT) => {
    layout.value = newLayout;
  };

  return {
    setNewLayout,
    layout,
  };
}
