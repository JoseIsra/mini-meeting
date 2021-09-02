import { ref } from 'vue';

const buttonState = ref<boolean>(false);

export default function useBtnToogle() {
  const setButtonState = (value: boolean) => {
    buttonState.value = value;
  };
  return {
    buttonState,
    setButtonState,
  };
}
