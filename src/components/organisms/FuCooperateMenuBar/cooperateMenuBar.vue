<template>
  <div class="a-menuBar">
    <section class="a-menuBar__box">
      <aside class="a-menuBar__periferics">
        <q-btn
          flat
          round
          :class="['a-menuBar__icon', { active: icon.active }]"
          v-for="icon in periferics"
          :key="icon.id"
          :icon="icon.active ? icon.onState : icon.offState"
          size="0.7rem"
          :disable="icon.id === '2' && perifericsControl.isScreenShared"
          @click="
            icon.active = !icon.active;
            tooglePeriferic(icon?.interaction);
          "
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
      </aside>
      <div class="a-menuBar__functions">
        <!-- TODO: Icon active like camera and mic porque cuando se presiona en dejar de compartir se queda con el círculo -->
        <q-btn
          flat
          round
          v-for="icon in functions"
          :class="[
            'a-menuBar__icon',
            {
              active:
                icon.id !== '1'
                  ? icon.active
                  : perifericsControl.isScreenShared,
            },
          ]"
          :key="icon.id"
          :icon="icon.onState"
          size="14px"
          :disabled="icon.id === '1' && perifericsControl.isCameraOn"
          @click="
            icon.active = !icon.active;
            handleFunctionSelected(icon.interaction, icon.id);
          "
        >
          <q-tooltip class="bg-grey-10" v-if="icon.id !== actionSelectionID">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="icon.id == actionSelectionID">
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
import { defineComponent, ref, reactive, PropType } from 'vue';
import { useRoute } from 'vue-router';
import {
  iconsPeriferics,
  iconsFunctions,
  iconsOptions,
} from '@/helpers/iconsMenuBar';
import FuCooperateMenu from 'molecules/FuCooperateMenu';
import { Icons, Periferics, Functionalities } from '@/types';
import {
  useToogleFunctions,
  useSidebarToogle,
  usePerifericsControls,
} from '@/composables';
import { WebRTCAdaptorType } from '@/types';
import { useUserMe } from '@/composables/userMe';
import { nanoid } from 'nanoid';

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
    webRTCAdaptor: {
      type: Object as PropType<WebRTCAdaptorType>,
    },
  },
  components: {
    FuCooperateMenu,
  },
  setup(props) {
    const route = useRoute();
    const periferics = ref<Icons[]>(iconsPeriferics);
    const functions = ref<Icons[]>(iconsFunctions);
    const options = ref<Icons[]>(iconsOptions);

    const objectPeriferics = reactive<Periferics>({
      WEBCAM: () => toggleCamera(),
      MIC: () => toggleMIC(),
    });

    const objectFunctionalities = reactive<Functionalities>({
      CHAT: () => toogleChat(),
      SHARESCREEN: () => toggleDesktopScreenCapture(),
      HANDUP: () => toogleHandUp(),
      SHARENOTES: () => toogleShareNotes(),
      USERLIST: () => toggleUsersList(),
    });

    let isActions = ref<boolean>(false);
    let renderMenu = ref<boolean>(false);
    let renderFunctionResponsiveMenu = ref<boolean>(false);
    let actionSelectionID = ref<string>('');
    let {
      functionsOnMenuBar,
      setShowChat,
      setShowNotes,
      setShowUsersList,
      addHandNotificationInfo,
      removeHandNotification,
    } = useToogleFunctions();
    let { isSidebarRender, setSidebarState } = useSidebarToogle();
    let {
      perifericsControl,
      setCameraState,
      setMicState,
      setScreenState,
      setVideoActivatedState,
    } = usePerifericsControls();
    const { userMe } = useUserMe();
    //**********************++FUNCIONES ********************** */
    const toogleChat = () => {
      if (!isSidebarRender.value) {
        console.log('chat??');
        setSidebarState(true);
        setShowChat(true);
        setShowNotes(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderChat) {
        setSidebarState(false);
        return;
      }
      setShowChat(true);
      setShowNotes(false);
      setShowUsersList(false);
    };

    const toogleShareNotes = () => {
      if (!isSidebarRender.value) {
        console.log('notes');
        setSidebarState(true);
        setShowNotes(true);
        setShowChat(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderNotes) {
        setSidebarState(false);
        return;
      }
      setShowNotes(true);
      setShowChat(false);
      setShowUsersList(false);
    };

    const toggleUsersList = () => {
      if (!isSidebarRender.value) {
        console.log('userslitst');
        setSidebarState(true);
        setShowUsersList(true);
        setShowNotes(false);
        setShowChat(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderUsersList) {
        setSidebarState(false);
        return;
      }
      setShowUsersList(true);
      setShowNotes(false);
      setShowChat(false);
    };

    const toggleCamera = () => {
      //perifericsControl.isCameraOn = !perifericsControl.isCameraOn;
      props.toggleLocalCamera?.();

      setCameraState(!perifericsControl.isCameraOn);

      if (!perifericsControl.isScreenShared && !perifericsControl.isCameraOn)
        setVideoActivatedState(false);
      if (perifericsControl.isScreenShared || perifericsControl.isCameraOn)
        setVideoActivatedState(true);
    };

    const toggleMIC = () => {
      props.toggleLocalMic?.();
      //perifericsControl.isMicOn = !perifericsControl.isMicOn;
      setMicState(!perifericsControl.isMicOn);
    };

    const toogleHandUp = () => {
      const riseHand = {
        id: nanoid(),
        streamId: userMe.id,
        streamName: userMe.name,
        eventType: 'HAND',
      };
      if (
        functionsOnMenuBar.handNotificationInfo.some(
          (notific) => notific.streamId === riseHand.streamId
        )
      ) {
        const downHand = { ...riseHand, eventType: 'NOHAND' };

        props.webRTCAdaptor?.sendData?.(
          route.query.streamId as string,
          JSON.stringify(downHand)
        );
        removeHandNotification(downHand.streamId);
        return;
      }
      props.webRTCAdaptor?.sendData?.(
        route.query.streamId as string,
        JSON.stringify(riseHand)
      );
      addHandNotificationInfo(riseHand);
    };

    const toggleDesktopScreenCapture = () => {
      props.toggleDesktopCapture?.();
      //perifericsControl.isScreenShared = !perifericsControl.isScreenShared;

      setScreenState(!perifericsControl.isScreenShared);
      //console.log('PROCESO DE PROYECCIÓN DE PANTALLA');
      if (!perifericsControl.isCameraOn) setVideoActivatedState(false);
      if (perifericsControl.isCameraOn) setVideoActivatedState(true);
    };

    const handleMenuPosition = (ubication?: string) => {
      isActions.value = ubication === 'actions' ? true : false;
      renderMenu.value = !renderMenu.value;
    };

    const handleFunctionSelected = (interaction?: string, ID?: string) => {
      /*       if (actionSelectionID.value == ID) {
        actionSelectionID.value = '';
        objectFunctionalities[interaction as keyof Functionalities]?.();
        return;
      } */
      actionSelectionID.value = ID as string;
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const tooglePeriferic = (interaction: string) => {
      objectPeriferics[interaction as keyof Periferics]();
    };

    return {
      periferics,
      perifericsControl,
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
