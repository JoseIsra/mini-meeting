<template>
  <section :style="styleOnMobile" :class="layoutStyle">
    <div
      :class="[
        'userVideoBox',
        { fade: mainViewState.pinnedUsers.includes(userMe.id) },
      ]"
      :style="backgroundColorSelected(userMe.id)"
    >
      <div v-show="!userMe.isVideoActivated" class="userVideoBox__avatar">
        <figure class="userVideoBox__avatar__imageBox">
          <img
            class="userVideoBox__avatar__imageBox__image"
            :src="userMe.avatar"
          />
        </figure>
        <div class="userVideoBox__avatar__info">
          <label class="userVideoBox__avatar__info__userName">
            {{ userMe.name }}
          </label>
          <q-icon
            :name="
              userMe.isMicOn
                ? iconsPeriferics.mic.onState
                : iconsPeriferics.mic.offState
            "
            color="white"
          />
        </div>
      </div>

      <video
        v-show="userMe.isVideoActivated"
        ref="localVideoTrack"
        class="userVideoBox__stream"
        playsinline
        muted
        autoplay
      ></video>
      <audio style="display: none" ref="localAudioTrack" muted autoplay></audio>

      <div v-show="userMe.isVideoActivated">
        <div class="userVideoBox__avatar__info__userName --video">
          {{ userMe.name }}
        </div>
      </div>
    </div>
    <div
      v-for="participant in controlUserToRender"
      :key="participant.id"
      :class="[
        'userVideoBox text-white',
        { fade: mainViewState.pinnedUsers.includes(participant.id) },
      ]"
      :style="backgroundColorSelected(participant.id)"
    >
      <div v-show="!participant.isVideoActivated" class="userVideoBox__avatar">
        <figure class="userVideoBox__avatar__imageBox">
          <img
            v-if="participant.avatar"
            class="userVideoBox__avatar__imageBox__image"
            :src="participant.avatar"
          />
          <q-spinner-oval
            v-if="!participant.avatar"
            color="primary"
            size="2em"
          />
        </figure>
        <div class="userVideoBox__avatar__info">
          <label class="userVideoBox__avatar__info__userName">
            {{ participant.name }}
          </label>
          <q-icon
            :name="participant.isMicOn ? 'mic' : 'mic_off'"
            size="20px"
            color="white"
          />
        </div>
      </div>
      <video
        v-show="participant.isVideoActivated"
        :id="'video-' + participant.id"
        class="userVideoBox__stream"
        autoplay
        :ref="
          ($el) => {
            participantVideoTracks[`video-${participant.id}`] = $el;
          }
        "
        playsinline
      ></video>
      <audio
        :id="'audio-' + participant.id"
        style="display: none"
        :ref="
          ($el) => {
            participantAudioTracks[`audio-${participant.id}`] = $el;
          }
        "
        autoplay
      ></audio>
      <div v-show="participant.isVideoActivated">
        <div class="userVideoBox__avatar__info__userName --video">
          {{ participant.name }}
        </div>
      </div>

      <q-btn
        flat
        round
        :ripple="false"
        :icon="
          mainViewState.pinnedUsers.includes(participant?.id)
            ? 'location_disabled'
            : 'gps_fixed'
        "
        color="white"
        class="userVideoBox__avatar__screenBtn"
        @click="
          mainViewState.pinnedUsers.includes(participant?.id)
            ? removePinnedUser(participant?.id)
            : addPinnedUser(participant?.id)
        "
        :disable="
          (mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.ANYONE &&
            mainViewState.locked !== MAIN_VIEW_LOCKED_TYPE.UNSET) ||
          (mainViewState.pinnedUsers.length >= 4 &&
            !mainViewState.pinnedUsers.includes(participant?.id))
        "
      >
        <q-tooltip
          anchor="top middle"
          class="bg-grey-10"
          self="bottom middle"
          :offset="[10, 10]"
          transition-show="scale"
          transition-hide="scale"
        >
          <label class="userVideoBox__avatar__screenBtn__label">{{
            mainViewState.pinnedUsers.includes(participant?.id)
              ? 'Desfijar para mi'
              : 'Fijar para mi'
          }}</label>
        </q-tooltip>
      </q-btn>
    </div>
    <!--  -->
    <div
      class="userVideoBox --moreUsers"
      v-show="
        $q.screen.lt.md
          ? admittedParticipants.length > 1
          : admittedParticipants.length > 5
      "
    >
      +{{
        $q.screen.lt.md
          ? admittedParticipants.length - 1
          : admittedParticipants.length - 5
      }}
    </div>
    <div
      v-for="(participant, index) in $q.screen.lt.md
        ? admittedParticipants.slice(0, -1)
        : admittedParticipants.slice(0, -5)"
      :key="index"
    >
      <video
        :srcObject.prop="participant.stream"
        :style="{ display: 'none' }"
        autoplay
        playsinline
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  useScreen,
  useHandleParticipants,
  useUserMe,
  useMainView,
} from '@/composables';
import { useLayout } from '@/composables/layout';
import { useUserColor } from '@/composables/userColor';
import { MAIN_VIEW_LOCKED_TYPE, LAYOUT } from '@/utils/enums';
import { iconsPeriferics } from '@/helpers/iconsMenuBar';

export default defineComponent({
  name: 'FuCooperateUserVideo',
  setup() {
    const { addPinnedUser, removePinnedUser, mainViewState } = useMainView();
    const {
      admittedParticipants,
      participantAudioTracks,
      participantVideoTracks,
    } = useHandleParticipants();

    const { userMe, localTracks, localAudioTrack, localVideoTrack } =
      useUserMe();

    const streamIdPinned = ref('');
    const $q = useQuasar();
    const { screenMinimized } = useScreen();
    const { colorList } = useUserColor();
    const { currentLayout } = useLayout();

    const controlUserToRender = computed(() => {
      return $q.screen.lt.md
        ? admittedParticipants.value.slice(-1)
        : admittedParticipants.value.slice(-5);
    });

    const styleOnMobile = computed(() => {
      return admittedParticipants.value.length > 5
        ? { 'justify-content': 'center' }
        : '';
    });

    const layoutStyle = computed(() => ({
      defaultLayout: currentLayout.value == LAYOUT.DEFAULT_LAYOUT,
      presentationLayout: currentLayout.value == LAYOUT.PRESENTATION_LAYOUT,
      fade: screenMinimized.value,
    }));

    watch(
      () => localTracks.value,
      () => {
        localTracks.value.forEach((track) => {
          if (track.getType() == 'audio') {
            track.attach(localAudioTrack.value);
          } else {
            track.attach(localVideoTrack.value);
          }
        });
      }
    );

    const backgroundColorSelected = (id: string) => {
      return {
        'background-color': colorList.get(id),
      };
    };

    return {
      userMe,
      admittedParticipants,
      streamIdPinned,
      controlUserToRender,
      styleOnMobile,
      screenMinimized,
      addPinnedUser,
      removePinnedUser,
      mainViewState,
      MAIN_VIEW_LOCKED_TYPE,
      iconsPeriferics,
      localAudioTrack,
      localVideoTrack,
      participantAudioTracks,
      participantVideoTracks,
      backgroundColorSelected,
      layoutStyle,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperateUserVideo.scss';
</style>
