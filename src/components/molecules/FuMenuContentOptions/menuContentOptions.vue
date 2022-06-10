<template>
  <section class="a-menu" ref="target">
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
          boardOptionLabel
        }}</label>
      </li>
      <q-separator spaced color="white" />
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
        <span v-show="renderLabel(option.interaction)">(Actual)</span>
      </li>
      <q-separator spaced color="white" />
      <li
        v-show="canEndCall"
        :class="[
          'a-menu__optionList__item',
          { '--important': options.fourthSection[0].important },
        ]"
        @click="handleOptionSelected(options.fourthSection[0].interaction)"
      >
        <q-icon
          :name="options.fourthSection[0].iconName"
          size="18px"
          color="white"
        />
        <label class="a-menu__optionList__item__description">{{
          options.fourthSection[0].description
        }}</label>
      </li>
      <li
        v-show="canLeaveCall"
        :class="[
          'a-menu__optionList__item',
          { '--important': options.fourthSection[1].important },
        ]"
        @click="handleOptionSelected(options.fourthSection[1].interaction)"
      >
        <q-icon
          :name="options.fourthSection[1].iconName"
          size="18px"
          color="white"
        />
        <label class="a-menu__optionList__item__description">{{
          options.fourthSection[1].description
        }}</label>
      </li>
    </ul>
    <q-dialog v-model="openModal">
      <fu-delete-room-modal v-if="cardContent == 'delete-card'" />
    </q-dialog>
    <q-dialog
      v-model="excaliModal"
      persitent
      maximized
      @hide="closeExcaliBoard"
    >
      <q-card class="relative-position" flat>
        <q-card-section tag="header">
          <q-card-actions class="absolute-right">
            <q-btn flat icon="close" round dense v-close-popup />
          </q-card-actions>
        </q-card-section>
        <q-card-section class="fit no-padding">
          <fu-excali-board />
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';
import { menuOptions, MenuOptions } from '@/helpers/menuOptions';
import FuDeleteRoomModal from 'molecules/FuDeleteRoomModal';
import {
  useHandleParticipants,
  useUserMe,
  useToogleFunctions,
  useMainView,
  useBoard,
  useScreen,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import { REASON_TO_LEAVE_ROOM, MAIN_VIEW_MODE, LAYOUT } from '@/utils/enums';
import { MenuOptionsInteractions } from '@/types/general';
import FuExcaliBoard from 'molecules/FuExcaliBoard';
import { onClickOutside } from '@vueuse/core';

export default defineComponent({
  name: 'FuMenuContentOptions',
  components: { FuDeleteRoomModal, FuExcaliBoard },
  setup() {
    const options = ref<MenuOptions>(menuOptions);
    let openModal = ref(false);
    const { openOptionsMenu } = useToogleFunctions();
    const { participants } = useHandleParticipants();

    const { userMe } = useUserMe();
    const { updateMainViewState } = useMainView();
    const { setNewLayout, layout } = useLayout();
    const { showExcaliBoard, setShowExcaliBoard } = useBoard();
    const { isMobile } = useScreen();
    const excaliModal = ref(false);
    const optionsMethodsObject = reactive<MenuOptionsInteractions>({
      LEAVE: () => {
        participants.value.length > 0
          ? window.xprops?.handleParticipantLeave()
          : window.xprops?.handleLeaveCall?.(
              REASON_TO_LEAVE_ROOM.I_CLOSE_ROOM,
              []
            );
      },
      END: () => openModalWithName('delete-card'),
      DEVICECONFIGURATION: () => openModalWithName('configuration-card'),
      BOARD: () => openExcaliBoard(),
      DEFAULT_LAYOUT: () => initDefaultLayout(),
      PRESENTATION_LAYOUT: () => initPresentationLayout(),
    });
    const cardContent = ref('');
    const target = ref(null);

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
    const renderExcaliOnMobile = ref(showExcaliBoard.value && isMobile());

    const openExcaliBoard = () => {
      setShowExcaliBoard(!showExcaliBoard.value);
      if (isMobile()) {
        excaliModal.value = true;
        return;
      }
      if (showExcaliBoard.value) {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.EXCALI,
          startedBy: userMe.id,
        });
      } else {
        updateMainViewState({
          mode: MAIN_VIEW_MODE.NONE,
          startedBy: '',
        });
      }
    };
    const initDefaultLayout = () => {
      setNewLayout(LAYOUT.DEFAULT_LAYOUT);
    };
    const initPresentationLayout = () => {
      setNewLayout(LAYOUT.PRESENTATION_LAYOUT);
    };

    const boardOptionLabel = computed(() => {
      return showExcaliBoard.value
        ? options.value.secondSection[0].secondDescription
        : options.value.secondSection[0].description;
    });

    const closeExcaliBoard = () => {
      setShowExcaliBoard(false);
    };

    const renderLabel = (interaction: string) => {
      return (
        (interaction == 'DEFAULT_LAYOUT' &&
          layout.value == LAYOUT.DEFAULT_LAYOUT) ||
        (interaction == 'PRESENTATION_LAYOUT' &&
          layout.value == LAYOUT.PRESENTATION_LAYOUT)
      );
    };
    onClickOutside(target, () => {
      openOptionsMenu(false);
    });

    return {
      options,
      handleOptionSelected,
      openModal,
      canEndCall,
      canLeaveCall,
      cardContent,
      showExcaliBoard,
      boardOptionLabel,
      closeExcaliBoard,
      renderExcaliOnMobile,
      excaliModal,
      renderLabel,
      target,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './menuContentOptions.scss';
</style>
