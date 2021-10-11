import { reactive } from 'vue';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isVideoActivated: boolean;
  roleId: number;
  isMicBlocked: boolean;
  isCameraBlocked: boolean;
  isScreenShareBlocked: boolean;
  stream?: MediaStream;
  fractalUserId: string;
  denied: number;
  existVideo?: boolean;
  urlOfVideo?: string;
  videoInstance?: HTMLMediaElement & { playerId: string };
  currentTime?: number;
  isPlayingVideo?: boolean;
  isRecording: boolean;
  isHost: boolean;
}

export interface UpdatedUserfields {
  id?: string;
  name?: string;
  avatar?: string;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  isScreenSharing?: boolean;
  isVideoActivated?: boolean;
  stream?: MediaStream;
  fractalUserId?: string;
  existVideo?: boolean;
  urlOfVideo?: string;
  videoInstance?: HTMLMediaElement & { playerId: string };
  currentTime?: number;
  isPlayingVideo?: boolean;
  isRecording?: boolean;
  isHost?: boolean;
}

// blocked: some functionalities blocked (mic, screen, camera)
// Role id: 'Admin|0' ; 'participant|1';

const userState = {} as User;
const pinnedStream = {} as MediaStream;

const userMe = reactive(userState);
const pinnedUserStream = reactive(pinnedStream);

export function useUserMe() {
  const setUserMe = (value: User) => {
    Object.assign(userState, value);
  };

  const updateUserMe = (value: UpdatedUserfields) => {
    Object.assign(userMe, { ...userMe, ...value });
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
  //   userMe.cameraDeviceId = value;
  // };

  const setVideoActivatedState = (value: boolean) => {
    userMe.isVideoActivated = value;
  };

  const setPinnedUser = (value: MediaStream) => {
    Object.assign(pinnedUserStream, value);
  };

  const setDenied = (state: number) => (userMe.denied = state);

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
  };
}
