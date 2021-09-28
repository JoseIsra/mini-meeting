import { ref } from 'vue';

import { Icons } from '@/types';

import {
  iconsPeriferics,
  iconsFunctions,
  iconsOptions,
} from '@/helpers/iconsMenuBar';

const periferics = ref<Icons[]>(iconsPeriferics);
const functions = ref<Icons[]>(iconsFunctions);
const options = ref<Icons[]>(iconsOptions);

export const useActions = () => {
  return {
    periferics,
    functions,
    options,
  };
};
