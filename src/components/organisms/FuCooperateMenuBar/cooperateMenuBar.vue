<template>
  <div class="a-menuBar">
    <aside class="a-menuBar__periferics">
      <q-btn
        flat
        round
        :class="['a-menuBar__icon', { active: icon.active }]"
        v-for="icon in iconsLeft"
        :key="icon.id"
        :icon="icon.active ? icon.onState : icon.offState"
        size="14px"
        @click="icon.active = !icon.active"
      >
        <q-tooltip class="bg-grey-10">
          <label class="a-menuBar__icon__tooltip">
            {{ icon.toolTipMessage }}
          </label>
        </q-tooltip>
      </q-btn>
    </aside>
    <div class="a-menuBar__functions">
      <q-btn
        flat
        round
        v-for="icon in iconsMiddle"
        :class="['a-menuBar__icon', { active: icon.active }]"
        :key="icon.id"
        :icon="icon.onState"
        size="14px"
        @click="icon.active = !icon.active"
      >
        <q-tooltip class="bg-grey-10">
          <label class="a-menuBar__icon__tooltip">
            {{ icon.toolTipMessage }}
          </label>
        </q-tooltip>
      </q-btn>
    </div>
    <aside class="a-menuBar__options">
      <q-btn
        round
        flat
        :ripple="false"
        v-for="icon in iconsRight"
        :key="icon.id"
        :icon="icon.onState"
        class="a-menuBar__icon"
        @click="handleMenuPosition(icon.ubication)"
        size="14px"
      >
        <q-tooltip class="bg-grey-10">
          <label class="a-menuBar__icon__tooltip">
            {{ icon.toolTipMessage }}
          </label>
        </q-tooltip>
      </q-btn>
      <fu-cooperate-menu
        v-show="renderMenu"
        :class="{ 'a-menuBar__menuLeft': isLeft }"
      />
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  iconsPeriferics,
  iconsFunctions,
  iconsOptions,
} from '@/helpers/iconsMenuBar';
import { FuCooperateMenu } from 'atoms/index';

interface Icons {
  id: string;
  onState: string;
  offState: string;
  active: boolean;
  toolTipMessage: string;
  ubication?: string;
}
export default defineComponent({
  name: 'FuCooperateMenuBar',
  components: {
    FuCooperateMenu,
  },
  setup() {
    const iconsLeft = ref<Icons[]>(iconsPeriferics);
    const iconsMiddle = ref<Icons[]>(iconsFunctions);
    const iconsRight = ref<Icons[]>(iconsOptions);
    let isLeft = ref<boolean>(false);
    let renderMenu = ref<boolean>(false);

    const handleMenuPosition = (ubication: string) => {
      // renderMenu.value = false;
      isLeft.value = ubication === 'left' ? true : false;
      renderMenu.value = !renderMenu.value;
    };
    return {
      iconsLeft,
      iconsMiddle,
      iconsRight,
      handleMenuPosition,
      isLeft,
      renderMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
