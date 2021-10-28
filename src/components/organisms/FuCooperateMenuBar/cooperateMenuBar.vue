<template>
  <div class="a-menuBar">
    <section class="a-menuBar__box">
      <aside class="a-menuBar__periferics">
        <!-- <q-btn
          flat
          round
          :class="['a-menuBar__icon', { active: icon.active }]"
          v-for="icon in periferics"
          :key="icon.id"
          :icon="
            userMe.isMicOn && userMe.isPublishing == 1
              ? icon.onState
              : userMe.isPublishing == 2
              ? icon.loadingState
              : icon.offState
          "
          size="0.7rem"
          :disable="disableAction(icon)"
          @click="tooglePeriferic(icon?.interaction)"
        >
          {{ userMe.isPublishing }}
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
        </q-btn> -->
        <q-btn
          flat
          round
          :class="[
            'a-menuBar__icon',
            { active: userMe.micPublishedState == 1 },
          ]"
          :icon="
            userMe.micPublishedState == 1
              ? iconsPeriferics.mic.onState
              : userMe.micPublishedState == 2
              ? iconsPeriferics.mic.loadingState
              : iconsPeriferics.mic.offState
          "
          :disable="userMe.isPublishing == 2 || userMe.isMicBlocked"
          size="0.7rem"
          @click="toggleMIC"
        >
          <!-- <q-tooltip class="bg-grey-10" v-if="!icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipSecondMessage }}
            </label>
          </q-tooltip> -->
        </q-btn>

        <q-btn
          flat
          round
          :class="[
            'a-menuBar__icon',
            { active: userMe.cameraPublishedState == 1 },
          ]"
          :icon="
            userMe.cameraPublishedState == 1
              ? iconsPeriferics.camera.onState
              : userMe.cameraPublishedState == 2
              ? iconsPeriferics.camera.loadingState
              : iconsPeriferics.camera.offState
          "
          :disable="userMe.isPublishing == 2 || userMe.isCameraBlocked"
          size="0.7rem"
          @click="toggleCamera"
        >
          <!-- <q-tooltip class="bg-grey-10" v-if="!icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
          <q-tooltip class="bg-grey-10" v-if="icon.active">
            <label class="a-menuBar__icon__tooltip">
              {{ icon.toolTipSecondMessage }}
            </label>
          </q-tooltip> -->
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
          <q-badge
            rounded
            floating
            v-show="icon.id === '3' && notificationCount > 0"
            :class="[
              'a-menuBar__icon__topin',
              { '--roleOne': userMe.roleId == 1 },
              waitingParticipants.length > 0
                ? '--participants'
                : '--noparticipants',
            ]"
          >
            {{ notificationCount }}
          </q-badge>
          <q-badge
            v-show="chatNotification && icon.interaction == 'CHAT'"
            class="a-menuBar__icon__chatbadge"
            rounded
            color="red"
            floating
          >
          </q-badge>

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
              v-if="handNotificationActive"
            >
              {{ icon.toolTipSecondMessage }}
            </label>
            <label v-else class="a-menuBar__icon__tooltip">
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
          <q-badge v-show="handNotificationActive" color="red" rounded floating
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
          v-show="icon.id == '1' ? canSeeActionsMenu : true"
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
    <q-dialog v-model="openAdminPanel">
      <fu-admin-panel />
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, computed } from 'vue';
import FuCooperateMenu from 'molecules/FuCooperateMenu';
import { Icons, Periferics, Functionalities } from '@/types';

import { iconsPeriferics } from '@/helpers/iconsMenuBar';

import { useToogleFunctions, useSidebarToogle } from '@/composables';
import { useUserMe } from '@/composables/userMe';
import { nanoid } from 'nanoid';
import FuCooperateNetworkInfo from 'molecules/FuCooperateNetworkInfo';

import { useInitWebRTC } from '@/composables/antMedia';
import { useScreen } from '@/composables/screen';
import { useActions } from '@/composables/actions';
import { useHandleParticipants } from '@/composables/participants';
import FuAdminPanel from 'organisms/FuAdminPanel';
import { useRoom } from '@/composables/room';
import { useHandleMessage } from '@/composables/chat';
import _ from 'lodash';

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
    FuAdminPanel,
  },
  setup(props) {
    const { sendData } = useInitWebRTC();

    const { functions, options } = useActions();

    const { waitingParticipants } = useHandleParticipants();

    const { roomState } = useRoom();

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

    const notificationCount = computed(() => {
      return userMe.roleId === 0
        ? waitingParticipants.value.length +
            functionsOnMenuBar.handNotificationInfo.length
        : functionsOnMenuBar.handNotificationInfo.length;
    });

    let { isSidebarRender, setSidebarState } = useSidebarToogle();

    const { userMe, setMicState, setVideoActivatedState } = useUserMe();

    let handNotificationActive = ref(false);
    const canSeeActionsMenu = ref(userMe.roleId === 0);
    const openAdminPanel = ref(false);
    const { userMessages, showChatNotification, chatNotification } =
      useHandleMessage();

    const lastMessageOwner = computed(() => {
      return userMessages.value[userMessages.value.length - 1].streamId;
    });

    watch(
      () => _.cloneDeep(userMessages.value),
      (current, prev) => {
        if (
          current.length - prev.length > 0 &&
          !functionsOnMenuBar.renderChat &&
          lastMessageOwner.value !== userMe.id
        ) {
          showChatNotification(true);
        } else {
          showChatNotification(false);
        }
      }
    );

    //**********************++FUNCIONES ********************** */
    const toogleChat = () => {
      if (!isSidebarRender.value) {
        setSidebarState(true);
        setShowChat(true);
        setShowNotes(false);
        setShowUsersList(false);
        showChatNotification(false);
        return;
      } else if (isSidebarRender.value && functionsOnMenuBar.renderChat) {
        setSidebarState(false);
        setShowChat(false);
        return;
      }
      setShowChat(true);
      setShowNotes(false);
      setShowUsersList(false);
      showChatNotification(false);
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
      // setCameraState(!userMe.isCameraOn);
      props.toggleLocalCamera?.();
      // if (!userMe.isScreenSharing && !userMe.isCameraOn)
      //   setVideoActivatedState(false);
      // if (userMe.isScreenSharing || userMe.isCameraOn)
      //   setVideoActivatedState(true);
    };

    const toggleMIC = () => {
      props.toggleLocalMic?.();
      setMicState(!userMe.isMicOn);
    };

    const toogleHandUp = () => {
      const riseHand = {
        id: nanoid(),
        to: 'ALL',
        from: userMe.id,
        streamName: userMe.name,
        eventType: 'HAND',
      };
      if (
        functionsOnMenuBar.handNotificationInfo.some(
          (notific) => notific.from === riseHand.from
        )
      ) {
        const downHand = { ...riseHand, eventType: 'NOHAND' };
        sendData(roomState.hostId, downHand);
        handNotificationActive.value = false;
        removeHandNotification(downHand.from);
        return;
      }
      handNotificationActive.value = true;
      sendData(roomState.hostId, riseHand);
      addHandNotificationInfo(riseHand);
    };

    const toggleDesktopScreenCapture = () => {
      if (!userMe.isCameraOn) setVideoActivatedState(false);
      props.toggleDesktopCapture?.();
      //userMe.isScreenShared = !userMe.isScreenShared;

      // setScreenState(!userMe.isScreenSharing);
      // if (userMe.isCameraOn) setVideoActivatedState(true);
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
        openAdminPanel.value = !openAdminPanel.value;
      } else {
        isActions.value = false;
        isOptions.value = true;
        openOptionsMenu(!functionsOnMenuBar.renderPopupMenu);
      }
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
      if (userMe.isPublishing == 2) {
        return true;
      }

      if (action.onState === 'mic' && userMe.isMicBlocked) {
        return true;
      }

      // if (
      //   action.id === '2' &&
      //   action.onState === 'videocam' &&
      //   userMe.isScreenSharing
      // ) {
      //   return true;
      // }

      if (action.onState === 'videocam' && userMe.isCameraBlocked) {
        return true;
      }

      if (action.onState === 'monitor' && userMe.isScreenShareBlocked) {
        return true;
      }

      // if (action.onState === 'monitor' && userMe.isCameraOn) {
      //   return true;
      // }
    };

    const openResponsiveMenuOfFunctions = () => {
      openFunctionResponsiveMenu(
        !functionsOnMenuBar.renderResponsiveFunctionMenu
      );
    };

    return {
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
      canSeeActionsMenu,
      toggleCamera,
      toggleMIC,
      iconsPeriferics,
      openAdminPanel,
      chatNotification,
      notificationCount,
      waitingParticipants,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateMenuBar.scss';
</style>
