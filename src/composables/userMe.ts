import { reactive, computed } from 'vue';

import { User } from '@/types/user';
import { ValueOf } from '@/types';
import _ from 'lodash';

// blocked: some functionalities blocked (mic, screen, camera)
// Role id: 'Admin|0' ; 'participant|1';

const userState = {} as User;
const pinnedStream = {} as MediaStream;

const userMe = reactive<User>(userState);
const pinnedUserStream = reactive(pinnedStream);

export function useUserMe() {
  const setUserMe = (value: Partial<User>) => {
    Object.assign(userState, value);
  };

  const updateUserMe = (value: Partial<User>) => {
    const updatedUser = _.cloneDeep(userMe);
    Object.keys(value).forEach((key: string) => {
      if (key != 'cameraPublishedState' && key != 'micPublishedState') {
        Object.defineProperty(updatedUser, key, {
          value: value[key as keyof User] as ValueOf<User>,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    });
    Object.assign(userMe, updatedUser);
  };

  userMe.cameraPublishedState = computed(() =>
    userMe.isCameraOn && userMe.isPublishing == 1
      ? 1
      : userMe.isPublishing == 2 && userMe.isCameraOn
      ? 2
      : 0
  );

  userMe.micPublishedState = computed(() =>
    userMe.isMicOn && userMe.isPublishing == 1
      ? 1
      : userMe.isPublishing == 2 && userMe.isMicOn
      ? 2
      : 0
  );

  const setMicState = (value: boolean) => {
    userMe.isMicOn = value;
  };

  const setCameraState = (value: boolean) => {
    userMe.isCameraOn = value;
  };

  const setScreenState = (value: boolean) => {
    userMe.isScreenSharing = value;
  };

  const setLocalMicBlock = (value: boolean) => {
    userMe.isMicBlocked = value;
  };

  const setLocalVideoBlock = (value: boolean) => {
    userMe.isCameraBlocked = value;
  };

  const setLocalScreenShareBlock = (value: boolean) => {
    userMe.isScreenShareBlocked = value;
  };

  // const setCameraDevice = (value: string) => {
  //   userMe.cameraId = value;
  // };

  const setVideoActivatedState = (value: boolean) => {
    userMe.isVideoActivated = value;
  };

  const setPinnedUser = (value: MediaStream) => {
    Object.assign(pinnedUserStream, value);
  };

  const setDenied = (state: number) => (userMe.denied = state);

  const setWatchChat = (value: boolean) => {
    userMe.hasSeenChat = value;
  };

  return {
    userMe,
    setUserMe,
    setPinnedUser,
    pinnedUserStream,
    setMicState,
    setCameraState,
    setScreenState,
    setVideoActivatedState,
    updateUserMe,
    setLocalMicBlock,
    setLocalVideoBlock,
    setLocalScreenShareBlock,
    setDenied,
    setWatchChat,
  };
}
