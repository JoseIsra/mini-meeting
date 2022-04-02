import { ref } from 'vue';

const openAdminPanel = ref(false);

export function usePanels() {
  const setOpenAdminPanel = (payload: boolean) => {
    openAdminPanel.value = payload;
  };
  return {
    openAdminPanel,
    setOpenAdminPanel,
  };
}
