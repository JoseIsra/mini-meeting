<template>
  <section class="a-menu">
    <ul class="a-menu__optionList">
      <li
        class="a-menu__optionList__item"
        v-for="option in options.firstSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="20px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        class="a-menu__optionList__item"
        v-for="option in options.secondSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <!-- <q-separator spaced color="white" /> -->
      <li
        class="a-menu__optionList__item"
        v-for="option in options.thirdSection"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
      >
        <q-icon :name="option.iconName" size="18px" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
      <q-separator spaced color="white" />
      <li
        v-for="option in options.fourthSection"
        :class="[
          'a-menu__optionList__item',
          { '--important': option.important },
        ]"
        :key="option.id"
        @click="handleOptionSelected(option.interaction)"
        v-show="
          option.id === '9'
            ? canEndCall
            : true || option.id === '10'
            ? canLeaveCall
            : true
        "
      >
        <q-icon :name="option.iconName" size="18px" color="white" />
        <label class="a-menu__optionList__item__description">{{
          option.description
        }}</label>
      </li>
    </ul>
    <q-dialog v-model="openModal">
      <fu-delete-room-modal v-if="cardContent == 'delete-card'" />
      <fu-device-configuration-modal
        v-if="cardContent == 'configuration-card'"
      />
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';
import FuDeleteRoomModal from 'molecules/FuDeleteRoomModal';
import {
  useInitWebRTC,
  useHandleParticipants,
  useUserMe,
  useToogleFunctions,
  useMainView,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import { REASON_TO_LEAVE_ROOM, MAIN_VIEW_MODE, LAYOUT } from '@/utils/enums';
import FuDeviceConfigurationModal from 'molecules/FuDeviceConfigurationModal';
import { MenuOptionsInteractions } from '@/types/general';

export default defineComponent({
  name: 'FuMenuContentOptions',
  components: { FuDeleteRoomModal, FuDeviceConfigurationModal },
  setup() {
    const options = ref<MenuOptions>(menuOptions);
    let openModal = ref(false);
    const { openOptionsMenu } = useToogleFunctions();
    const { participants } = useHandleParticipants();

    const { userMe } = useUserMe();
    const { sendNotificationEvent } = useInitWebRTC();
    const { mainViewState, updateMainViewState } = useMainView();
    const { setNewLayout } = useLayout();

    const optionsMethodsObject = reactive<MenuOptionsInteractions>({
      LEAVE: () => {
        participants.value.length > 0
          ? window.xprops?.handleParticipantLeave()
          : window.xprops?.handleLeaveCall?.(
              REASON_TO_LEAVE_ROOM.I_CLOSE_ROOM,
              []
            );
        if (userMe.isRecording) {
          sendNotificationEvent('RECORDING_STOPPED', userMe.id);
        }
      },
      END: () => openModalWithName('delete-card'),
      DEVICECONFIGURATION: () => openModalWithName('configuration-card'),
      BOARD: () => openExcaliBoard(),
      DEFAULT_LAYOUT: () => initDefaultLayout(),
      PRESENTATION_LAYOUT: () => initPresentationLayout(),
    });
    const cardContent = ref('');

    const openModalWithName = (modalName: string) => {
      openModal.value = true;
      cardContent.value = modalName;
    };

    const handleOptionSelected = (interaction?: string) => {
      optionsMethodsObject[interaction as keyof MenuOptionsInteractions]();
      openOptionsMenu(false);
    };

    const canEndCall = ref(userMe.roleId === 0);

    const canLeaveCall = ref(
      (userMe.roleId === 0 || userMe.roleId === 1) && !userMe.isHost
    );

    const openExcaliBoard = () => {
      // open iframe
      // https://excalidraw.com/
      if (mainViewState.mode == MAIN_VIEW_MODE.EXCALI) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          startedBy: '',
        });
      } else {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.EXCALI,
          startedBy: userMe.id,
        });
      }
    };
    const initDefaultLayout = () => {
      setNewLayout(LAYOUT.DEFAULT_LAYOUT);
    };
    const initPresentationLayout = () => {
      setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
    };

    return {
      options,
      handleOptionSelected,
      openModal,
      canEndCall,
      canLeaveCall,
      cardContent,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
