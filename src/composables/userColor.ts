import { USER_BACKGROUND_PALETTE } from '@/config/constants';
import { getRandomNumberBetween } from '@/utils/methods';

const colorList = new Map<string, string>();
export function useUserColor() {
  const setUserBackgroundColor = (id: string) => {
    const numberRandom = getRandomNumberBetween(0, 7);
    const color = USER_BACKGROUND_PALETTE[numberRandom];
    colorList.set(id, color);
  };

  return {
    setUserBackgroundColor,
    colorList,
  };
}
