<template>
  <div class="a-menuBar">
    <section class="a-menuBar__box">
      <aside class="a-menuBar__periferics">
        <q-btn
          flat
          round
          :class="['a-menuBar__icon', { active: icon.active === false }]"
          v-for="icon in periferics"
          :key="icon.id"
          :icon="icon.active ? icon.offState : icon.onState"
          size="0.7rem"
          @click="
            icon.active = !icon.active;
            tooglePeriferic(icon.interaction);
          "
        >
          <q-tooltip class="bg-grey-10" v-if="icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="!icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipSecondMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </aside>
      <div class="a-menuBar__functions">
        <q-btn
          flat
          round
          v-for="icon in functions"
          :class="[
            'a-menuBar__icon',
            { active: icon.id === actionSelectionID },
          ]"
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
      <div class="a-menuBar__functions__responsive">
        <q-btn
          icon="reorder"
          flat
          round
          color="white"
          @click="renderFunctionResponsiveMenu = !renderFunctionResponsiveMenu"
        />
        <fu-cooperate-menu
          v-show="renderFunctionResponsiveMenu"
          :isActions="false"
          :renderFunctions="true"
        />
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
          :renderFunctions="false"
        />
      </aside>
    </section>
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
import { Icons } from '@/types';
export default defineComponent({
  name: 'FuCooperateMenuBar',
  props: {
    toggleLocalCamera: {
      type: Function,
    },
    toggleLocalMic: {
      type: Function,
    },
  },
  components: {
    FuCooperateMenu,
  },
  setup(props, { emit }) {
    const periferics = ref<Icons[]>(iconsPeriferics);
    const functions = ref<Icons[]>(iconsFunctions);
    const options = ref<Icons[]>(iconsOptions);
    let isActions = ref<boolean>(false);
    let renderMenu = ref<boolean>(false);
    let renderFunctionResponsiveMenu = ref<boolean>(false);
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
      emit('show-sidebar', interaction);
    };
    const tooglePeriferic = (interaction: string) => {
      if (interaction == 'WEBCAM') {
        props.toggleLocalCamera?.();
      } else {
        props.toggleLocalMic?.();
      }
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
      tooglePeriferic,
      renderFunctionResponsiveMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
