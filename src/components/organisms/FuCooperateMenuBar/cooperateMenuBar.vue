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
          :disable="disableAction(icon)"
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
            {
              activeHand:
                handNotificationActive && icon.interaction == 'HANDUP',
            },
          ]"
          :key="icon.id"
          :icon="icon.onState"
          size="14px"
          :disabled="disableAction(icon)"
          v-on="
            icon.behaviour == 'ESPECIAL'
              ? { click: () => handleEspecialBehaviour(icon.interaction) }
              : {
                  click: () =>
                    handleFunctionSelected(icon.interaction, icon.id),
                }
          "
        >
          <q-tooltip class="bg-grey-10" v-if="icon.behaviour == 'NORMAL'">
            <label
              class="a-menuBar__icon__tooltip"
              v-if="icon.id !== functionsOnMenuBar.selectedButtonID"
            >
              {{ icon.toolTipMessage }}
            </label>
            <label v-else class="a-menuBar__icon__tooltip">
              {{ icon.toolTipSecondMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="icon.behaviour == 'ESPECIAL'">
            <label
              class="a-menuBar__icon__tooltip"
              v-if="functionsOnMenuBar.handNotificationInfo.length > 0"
            >
              {{ icon.toolTipSecondMessage }}
            </label>
            <label
              class="a-menuBar__icon__tooltip"
              v-if="functionsOnMenuBar.handNotificationInfo.length == 0"
            >
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
          @click="openResponsiveMenuOfFunctions"
        />
        <q-btn
          icon="pan_tool"
          class="a-menuBar__functions__responsive__handBtn"
          flat
          round
          color="grey-1"
          size="12px"
          @click="handleEspecialBehaviour('HANDUP')"
        >
          <q-badge
            v-show="functionsOnMenuBar.handNotificationInfo.length > 0"
            color="red"
            rounded
            floating
            >x</q-badge
          >
        </q-btn>
        <fu-cooperate-menu
          v-show="functionsOnMenuBar.renderResponsiveFunctionMenu"
          :objectFunctionalities="objectFunctionalities"
          class="a-menuBar__functions__responsive__menu"
          :isActions="false"
          :renderFunctions="true"
          width="100%"
          bottom="120%"
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
          v-show="functionsOnMenuBar.renderPopupMenu"
          class="a-menuBar__options__menu"
          :isActions="isActions"
          :isOptions="isOptions"
          :renderFunctions="false"
          width="280px"
          bottom="120%"
        />
      </aside>
      <fu-cooperate-network-info v-show="openNetworkConfig" />
      <fu-cooperate-menu
        class="a-menuBar__responsiveOptions"
        v-show="functionsOnMenuBar.renderPopupMenu"
        :isActions="isActions"
        :isOptions="isOptions"
        :renderFunctions="false"
        width="100%"
        bottom="120%"
      />
    </section>
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

import { useToogleFunctions, useSidebarToogle } from '@/composables';
import { useUserMe } from '@/composables/userMe';
import { nanoid } from 'nanoid';
import FuCooperateNetworkInfo from 'molecules/FuCooperateNetworkInfo';

import { useInitWebRTC } from '@/composables/antMedia';
import { useScreen } from '@/composables/screen';

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
    FuCooperateNetworkInfo,
  },
  setup(props) {
    const { sendData } = useInitWebRTC();
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
      MINIMIZE: () => minimizeScreen(),
    });

    let isActions = ref<boolean>(false);
    let isOptions = ref<boolean>(false);
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
      openOptionsMenu,
      openFunctionResponsiveMenu,
    } = useToogleFunctions();
    let { isSidebarRender, setSidebarState } = useSidebarToogle();
    const {
      userMe,
      setCameraState,
      setMicState,
      setScreenState,
      setVideoActivatedState,
    } = useUserMe();
    let handNotificationActive = ref(false);

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
        sendData(userMe.id, downHand);
        handNotificationActive.value = false;
        removeHandNotification(downHand.streamId);
        return;
      }
      handNotificationActive.value = true;
      sendData(userMe.id, riseHand);
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

    const { updateScreenState } = useScreen();

    const minimizeScreen = () => {
      updateScreenState();
      setSidebarState(false);
      setIDButtonSelected('');
    };

    const handleMenuPosition = (ubication?: string) => {
      if (ubication == 'actions') {
        isActions.value = true;
        isOptions.value = false;
      } else {
        isActions.value = false;
        isOptions.value = true;
      }
      openOptionsMenu(!functionsOnMenuBar.renderPopupMenu);
    };

    const handleFunctionSelected = (interaction?: string, ID?: string) => {
      if (functionsOnMenuBar.selectedButtonID == ID) {
        setIDButtonSelected('');
        objectFunctionalities[interaction as keyof Functionalities]?.();
        return;
      }
      setIDButtonSelected(ID as string);
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const handleEspecialBehaviour = (interaction: string) => {
      objectFunctionalities[interaction as keyof Functionalities]?.();
    };

    const tooglePeriferic = (interaction: string) => {
      objectPeriferics[interaction as keyof Periferics]();
    };

    const disableAction = (action: Icons) => {
      if (action.onState === 'mic' && userMe.isMicBlocked) {
        return true;
      }

      if (
        action.id === '2' &&
        action.onState === 'videocam' &&
        userMe.isScreenSharing
      ) {
        return true;
      }

      if (action.onState === 'videocam' && userMe.isVideoBlocked) {
        return true;
      }

      if (action.onState === 'monitor' && userMe.isScreenShareBlocked) {
        return true;
      }

      if (action.onState === 'monitor' && userMe.isCameraOn) {
        return true;
      }
    };

    const openResponsiveMenuOfFunctions = () => {
      openFunctionResponsiveMenu(
        !functionsOnMenuBar.renderResponsiveFunctionMenu
      );
    };

    return {
      periferics,
      userMe,
      functions,
      options,
      handleMenuPosition,
      isActions,
      handleFunctionSelected,
      actionSelectionID,
      tooglePeriferic,
      renderFunctionResponsiveMenu,
      openNetworkConfig,
      functionsOnMenuBar,
      objectFunctionalities,
      isOptions,
      disableAction,
      handleEspecialBehaviour,
      handNotificationActive,
      openResponsiveMenuOfFunctions,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
