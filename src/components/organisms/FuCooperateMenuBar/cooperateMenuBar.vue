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
          :class="['a-menuBar__icon', { active: icon.id == actionSelectionID }]"
          :key="icon.id"
          :icon="icon.onState"
          size="14px"
          @click="handleFunctionSelected(icon.interaction, icon.id)"
        >
          <q-tooltip class="bg-grey-10" v-if="!icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipSecondMessage }}
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
          class="a-menuBar__functions__responsive__menu"
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
          class="a-menuBar__options__menu"
          :isActions="isActions"
          :renderFunctions="false"
        />
      </aside>
    </section>
    <fu-cooperate-menu
      class="a-menuBar__responsiveOptions"
      v-show="renderMenu"
      :isActions="isActions"
      :renderFunctions="false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import {
  iconsPeriferics,
  iconsFunctions,
  iconsOptions,
} from '@/helpers/iconsMenuBar';
import FuCooperateMenu from 'molecules/FuCooperateMenu';
import { Icons, Periferics, Functionalities } from '@/types';
import {
  useChatToogle,
  useNotesToogle,
  useSidebarToogle,
} from '@/componsables';

export default defineComponent({
  name: 'FuCooperateMenuBar',
  props: {
    toggleLocalCamera: {
      type: Function,
    },
    toggleLocalMic: {
      type: Function,
    },
    toggleDesktopCapture: {
      type: Function,
    },
  },
  components: {
    FuCooperateMenu,
  },
  setup(props) {
    const periferics = ref<Icons[]>(iconsPeriferics);
    const functions = ref<Icons[]>(iconsFunctions);
    const objectPeriferics = reactive<Periferics>({
      WEBCAM: () => props.toggleLocalCamera?.() as void,
      MIC: () => props.toggleLocalMic?.() as void,
    });
    const objectFunctionalities = reactive<Functionalities>({
      CHAT: () => toogleChat(),
      SHARESCREEN: () => props.toggleDesktopCapture?.() as void,
      SHARENOTES: () => toogleNotes(),
    });
    const options = ref<Icons[]>(iconsOptions);
    let isActions = ref<boolean>(false);
    let renderMenu = ref<boolean>(false);
    let renderFunctionResponsiveMenu = ref<boolean>(false);
    let actionSelectionID = ref<string>('');
    let { functionsOnMenuBar, setShowChat } = useChatToogle();
    let { renderNotes, setShowNotes } = useNotesToogle();
    let { isSidebarRender, setSidebarState } = useSidebarToogle();

    //**********************++FUNCIONES ********************** */
    const toogleChat = () => {
      if (!isSidebarRender.value) {
        console.log('chat??');
        setSidebarState(true);
        setShowChat(true);
        setShowNotes(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.thechat) {
        setSidebarState(false);
        return;
      }
      setShowChat(true);
      setShowNotes(false);
    };
    const toogleNotes = () => {
      if (!isSidebarRender.value) {
        console.log('notes');
        setSidebarState(true);
        setShowNotes(true);
        setShowChat(false);
        return;
      } else if (isSidebarRender.value && renderNotes.value) {
        setSidebarState(false);
        return;
      }
      setShowNotes(true);
      setShowChat(false);
    };

    const handleMenuPosition = (ubication: string) => {
      isActions.value = ubication === 'actions' ? true : false;
      renderMenu.value = !renderMenu.value;
    };

    const handleFunctionSelected = (interaction: string, ID: string) => {
      if (actionSelectionID.value == ID) {
        actionSelectionID.value = '';
        objectFunctionalities[interaction as keyof Functionalities]?.();
        return;
      }
      actionSelectionID.value = ID;
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const tooglePeriferic = (interaction: string) => {
      objectPeriferics[interaction as keyof Periferics]();
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
