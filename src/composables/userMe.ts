import { reactive } from 'vue';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isVideoActivated: boolean;
}

const userState = {} as User;
const pinnedStream = {} as MediaStream;

const userMe = reactive(userState);
const pinnedUserStream = reactive(pinnedStream);

export function useUserMe() {
  const setUserMe = (value: User) => {
    Object.assign(userState, value);
  };

  const setMicState = (value: boolean) => {
    userMe.isMicOn = value;
  };
  const setCameraState = (value: boolean) => {
    userMe.isCameraOn = value;
  };

  const setScreenState = (value: boolean) => {
    userMe.isScreenSharing = value;
  };

  // const setCameraDevice = (value: string) => {
  //   userMe.cameraDeviceId = value;
  // };

  const setVideoActivatedState = (value: boolean) => {
    userMe.isVideoActivated = value;
  };

  const setPinnedUser = (value: MediaStream) => {
    Object.assign(pinnedUserStream, value);
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
  };
}
