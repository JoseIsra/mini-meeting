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
          :disable="icon.id === '2' && userMe.isScreenSharing"
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
                  ? icon.id == functionsOnMenuBar.selectedButtonID
                  : userMe.isScreenSharing,
            },
          ]"
          :key="icon.id"
          :icon="icon.onState"
          size="14px"
          :disabled="icon.id === '1' && userMe.isCameraOn"
          @click="
            icon.active = !icon.active;
            handleFunctionSelected(icon.interaction, icon.id);
          "
        >
          <q-tooltip
            class="bg-grey-10"
            v-if="icon.id !== functionsOnMenuBar.selectedButtonID"
          >
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip
            class="bg-grey-10"
            v-if="icon.id == functionsOnMenuBar.selectedButtonID"
          >
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
          :webRTCAdaptor="webRTCAdaptor"
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
      <fu-cooperate-network-info v-show="openNetworkConfig" />
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
import { useToogleFunctions, useSidebarToogle } from '@/composables';
import { WebRTCAdaptorType } from '@/types';
import { useUserMe } from '@/composables/userMe';
import { nanoid } from 'nanoid';
import FuCooperateNetworkInfo from 'molecules/FuCooperateNetworkInfo';

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
    FuCooperateNetworkInfo,
  },
  setup(props) {
    const route = useRoute();
    const periferics = ref<Icons[]>(iconsPeriferics);
    const functions = ref<Icons[]>(iconsFunctions);
    const options = ref<Icons[]>(iconsOptions);
    let openNetworkConfig = ref(false);
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
      CONNECTION: () => toggleConnectionModal(),
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
      setIDButtonSelected,
    } = useToogleFunctions();
    let { isSidebarRender, setSidebarState } = useSidebarToogle();
    const {
      userMe,
      setCameraState,
      setMicState,
      setScreenState,
      setVideoActivatedState,
    } = useUserMe();
    //**********************++FUNCIONES ********************** */
    const toogleChat = () => {
      if (!isSidebarRender.value) {
        setSidebarState(true);
        setShowChat(true);
        setShowNotes(false);
        setShowUsersList(false);
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
        setShowUsersList(false);
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
      //userMe.isCameraOn = !userMe.isCameraOn;
      props.toggleLocalCamera?.();

      setCameraState(!userMe.isCameraOn);

      if (!userMe.isScreenSharing && !userMe.isCameraOn)
        setVideoActivatedState(false);
      if (userMe.isScreenSharing || userMe.isCameraOn)
        setVideoActivatedState(true);
    };

    const toggleMIC = () => {
      props.toggleLocalMic?.();
      //userMe.isMicOn = !userMe.isMicOn;
      setMicState(!userMe.isMicOn);
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
      //userMe.isScreenShared = !userMe.isScreenShared;

      setScreenState(!userMe.isScreenSharing);
      //console.log('PROCESO DE PROYECCIÓN DE PANTALLA');
      if (!userMe.isCameraOn) setVideoActivatedState(false);
      if (userMe.isCameraOn) setVideoActivatedState(true);
    };

    const toggleConnectionModal = () => {
      openNetworkConfig.value = !openNetworkConfig.value;
    };

    const handleMenuPosition = (ubication?: string) => {
      isActions.value = ubication === 'actions' ? true : false;
      renderMenu.value = !renderMenu.value;
    };

    const handleFunctionSelected = (interaction?: string, ID?: string) => {
      if (functionsOnMenuBar.selectedButtonID == ID) {
        //si se hace toggle a un ícon ya seleccionado
        // actionSelectionID.value = '';
        setIDButtonSelected('');
        objectFunctionalities[interaction as keyof Functionalities]?.();
        return;
      }
      setIDButtonSelected(ID as string);
      // actionSelectionID.value = ID as string;
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const tooglePeriferic = (interaction: string) => {
      objectPeriferics[interaction as keyof Periferics]();
    };

    return {
      periferics,
      userMe,
      functions,
      options,
      handleMenuPosition,
      isActions,
      renderMenu,
      handleFunctionSelected,
      actionSelectionID,
      tooglePeriferic,
      renderFunctionResponsiveMenu,
      openNetworkConfig,
      functionsOnMenuBar,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
