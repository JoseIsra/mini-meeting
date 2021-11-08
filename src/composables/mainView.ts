import { reactive } from 'vue';
import { MainViewState } from '@/types/mainView';
import { useInitWebRTC } from '@/composables/antMedia';
import _ from 'lodash';
import { MAIN_VIEW_LOCKED_TYPE, MAIN_VIEW_MODE } from '@/utils/enums';
import { useRoom } from './room';
import { useUserMe } from './userMe';

const { sendData } = useInitWebRTC();
const { roomState } = useRoom();
const { userMe } = useUserMe();

let mainViewState = reactive<MainViewState>({
  mode: MAIN_VIEW_MODE.NONE,
  pinnedUsers: [],
  locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
  startedBy: '',
} as MainViewState);

export function useMainView() {
  const setMainViewState = (fields: MainViewState) => {
    mainViewState = { ...fields };
  };

  const updateMainViewState = (fields: Partial<MainViewState>) => {
    let clonedMainView = _.clone(mainViewState);
    clonedMainView = { ...clonedMainView, ...fields };
    Object.assign(mainViewState, clonedMainView);
  };

  const cleanMainViewState = () => {
    mainViewState = {
      mode: MAIN_VIEW_MODE.NONE,
      pinnedUsers: [],
      locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
      startedBy: '',
    };
  };

  const updateMainViewStateForAll = (fields: Partial<MainViewState>) => {
    let clonedMainView = _.clone(mainViewState);
    clonedMainView = { ...clonedMainView, ...fields };
    Object.assign(mainViewState, clonedMainView);
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const cleanMainViewStateForAll = () => {
    mainViewState = {
      mode: MAIN_VIEW_MODE.NONE,
      pinnedUsers: [],
      locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
      startedBy: '',
    };
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const addPinnedUser = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState.pinnedUsers);
    currentPinnedUsers.push(userId);
    if (mainViewState.mode === MAIN_VIEW_MODE.USER) {
      updateMainViewState({ pinnedUsers: currentPinnedUsers });
    } else {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.USER,
        pinnedUsers: [userId],
        locked: MAIN_VIEW_LOCKED_TYPE.ANYONE,
        startedBy: userMe.id,
      });
    }
  };

  const removePinnedUser = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState.pinnedUsers);
    const index = currentPinnedUsers.indexOf(userId);
    if (index > -1) {
      currentPinnedUsers.splice(index, 1);
      if (currentPinnedUsers.length === 0) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
          pinnedUsers: currentPinnedUsers,
          startedBy: '',
        });
      } else {
        updateMainViewState({ pinnedUsers: currentPinnedUsers });
      }
    }
  };

  const addPinnedUserForAll = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState.pinnedUsers);
    currentPinnedUsers.push(userId);
    if (mainViewState.mode === MAIN_VIEW_MODE.USER) {
      updateMainViewState({ pinnedUsers: currentPinnedUsers });
    } else {
      updateMainViewState({
        mode: MAIN_VIEW_MODE.USER,
        pinnedUsers: [userId],
        locked: MAIN_VIEW_LOCKED_TYPE.NORMAL_USERS,
        startedBy: userMe.id,
      });
    }
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  const removePinnedUserForAll = (userId: string) => {
    const currentPinnedUsers = _.clone(mainViewState.pinnedUsers);
    const index = currentPinnedUsers.indexOf(userId);
    if (index > -1) {
      currentPinnedUsers.splice(index, 1);

      if (currentPinnedUsers.length === 0) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          locked: MAIN_VIEW_LOCKED_TYPE.UNSET,
          startedBy: '',
          pinnedUsers: currentPinnedUsers,
        });
      } else {
        updateMainViewState({ pinnedUsers: currentPinnedUsers });
      }
    }
    /*  */
    sendData(roomState.hostId, {
      eventType: 'SET_FULL_SCREEN',
      mainViewState,
    });
  };

  return {
    mainViewState,
    setMainViewState,
    updateMainViewState,
    cleanMainViewState,
    addPinnedUser,
    removePinnedUser,
    updateMainViewStateForAll,
    addPinnedUserForAll,
    removePinnedUserForAll,
    cleanMainViewStateForAll,
  };
}
