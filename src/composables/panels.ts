import { ref } from 'vue';

const openAdminPanel = ref(false);
const openTabSharedWarning = ref(false);

export function usePanels() {
  const setOpenAdminPanel = (payload: boolean) => {
    openAdminPanel.value = payload;
  };

  const setTabSharedWarning = (payload: boolean) => {
    openTabSharedWarning.value = payload;
  };

  return {
    openAdminPanel,
    setOpenAdminPanel,
    openTabSharedWarning,
    setTabSharedWarning,
  };
}
