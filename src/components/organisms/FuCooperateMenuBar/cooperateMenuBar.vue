<template>
  <div class="a-menuBar">
    <aside class="a-menuBar__periferics">
      <q-btn
        flat
        round
        :class="['a-menuBar__icon', { active: icon.active }]"
        v-for="icon in periferics"
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
        v-for="icon in functions"
        :class="['a-menuBar__icon', { active: icon.id === actionSelectionID }]"
        :key="icon.id"
        :icon="icon.onState"
        size="14px"
        @click="handleFunctionSelected(icon.interaction, icon.id)"
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
        v-for="icon in options"
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
        :isActions="isActions"
        :class="{ 'a-menuBar__menuAction': isActions }"
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
import FuCooperateMenu from 'molecules/FuCooperateMenu';

interface Icons {
  id: string;
  onState: string;
  offState: string;
  active: boolean;
  toolTipMessage: string;
  ubication?: string;
  interaction?: string;
}
export default defineComponent({
  name: 'FuCooperateMenuBar',
  components: {
    FuCooperateMenu,
  },
  setup() {
    const periferics = ref<Icons[]>(iconsPeriferics);
    const functions = ref<Icons[]>(iconsFunctions);
    const options = ref<Icons[]>(iconsOptions);
    let isActions = ref<boolean>(false);
    let renderMenu = ref<boolean>(false);
    // let actionSelected = ref<boolean>(false);
    let actionSelectionID = ref<string>('');

    const handleMenuPosition = (ubication: string) => {
      isActions.value = ubication === 'actions' ? true : false;
      renderMenu.value = !renderMenu.value;
    };
    const handleFunctionSelected = (interaction: string, ID: string) => {
      if (actionSelectionID.value == ID) {
        actionSelectionID.value = '';
        return;
      }
      actionSelectionID.value = ID;
      // this.$emit('show-sidebar',interaction);
    };

    return {
      periferics,
      functions,
      options,
      handleMenuPosition,
      isActions,
      renderMenu,
      handleFunctionSelected,
      actionSelectionID,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
