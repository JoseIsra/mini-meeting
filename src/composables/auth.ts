import { reactive } from 'vue';

interface AuthState {
  loadingOrErrorMessage: string;
  existRoom: boolean;
  isLoadingOrError: boolean;
}

const authState = reactive<AuthState>({
  loadingOrErrorMessage: '',
  existRoom: false,
  isLoadingOrError: true,
} as AuthState);

export function useAuthState() {
  const setLoadingOrErrorMessage = (message: string) => {
    authState.loadingOrErrorMessage = message;
  };
  const setExistRoom = (existRoom: boolean) => {
    authState.existRoom = existRoom;
  };
  const setIsLoadingOrError = (isLoadingOrError: boolean) => {
    authState.isLoadingOrError = isLoadingOrError;
  };

  return {
    authState,
    setLoadingOrErrorMessage,
    setExistRoom,
    setIsLoadingOrError,
  };
}
