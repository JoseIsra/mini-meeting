<template>
  <div class="t-cooperate">
    <div class="t-cooperate__page" v-show="!isLoadingOrError">
      <fu-cooperate @mounted="fuCooperateMountedHandler" />
    </div>

    <fu-t-loading
      v-if="isLoadingOrError"
      :loadingMessage="loadingOrErrorMessage"
      @handleLeaveCall="handleZoidLeaveCall"
    />

    <!-- TODO: Move This (Prev of recording) -->
    <video
      v-show="false"
      id="localVideo2"
      class="a-userVideo__box__stream"
      autoplay
      muted
      playsinline
    ></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, onMounted, onUnmounted } from 'vue';
import FuCooperate from 'organisms/FuCooperate';
import { useRoute } from 'vue-router';
import { useRoom, useAuthState, useUserMe } from '@/composables';
import { useJitsi } from '@/composables/jitsi';
import FuTLoading from 'organisms/FuLoading';
import {
  PERMISSION_STATUS,
  REASON_TO_LEAVE_ROOM,
  ROOM_PRIVACY,
} from '@/utils/enums';

import DetectRTC from 'detectrtc';
import { regexConferenceName } from '@/config/constants';

export default defineComponent({
  name: 'FuTCooperate',
  components: {
    FuCooperate,
    FuTLoading,
  },
  setup() {
    const {
      userMe,
      setUserMe,
      setVideoActivatedState,
      // setMicState,
      setCameraState,
      updateUserMe,
    } = useUserMe();

    const { roomState, setRoom } = useRoom();

    const route = useRoute();

    const { authState, setLoadingOrErrorMessage } = useAuthState();

    const { stablisConnection, diconnectAll } = useJitsi();

    const streamId =
      window?.xprops?.streamId || (route.query.streamId as string) || '';

    const streamName =
      window?.xprops?.streamName || (route.query.streamName as string);

    const defaultAvatar =
      'https://encrypted.fractalup.com/file/FractalUp/Logos/logo_azul.svg';

    const avatar =
      window?.xprops?.photoURL ||
      (route.query.photoURL as string) ||
      defaultAvatar;

    if (avatar !== defaultAvatar) {
      const splittedAvatarUrl = avatar.split('.');
      const extension = splittedAvatarUrl[splittedAvatarUrl.length - 1];
      const imageExtensions = ['png', 'jpg', 'jpeg', 'svg'];
      if (!imageExtensions.includes(extension)) {
        updateUserMe({
          avatar: defaultAvatar,
        });
      }
    }

    let roomId = window?.xprops?.roomId || (route.query.roomId as string) || '';
    roomId = roomId
      .trim()
      .replace(regexConferenceName, '')
      .replace(/\s/g, '_')
      .toLowerCase();
    const classroomId =
      window?.xprops?.classroomId || (route.query.classroomId as string) || '1';

    const roleId =
      window.xprops?.roleId || parseInt(route.query.roleId as string) || 0;

    let roomRestriction = window.xprops?.roomRestriction as number;

    if (!roomRestriction) {
      roomRestriction =
        parseInt(route.query.roomRestriction as string) || ROOM_PRIVACY.PUBLIC;
    }

    const isMicLocked = window.xprops?.isMicLocked || false;

    const cameraId =
      window.xprops?.cameraId || (route.query.cameraId as string);

    const micId = window.xprops?.micId || (route.query.micId as string);

    const speakerId =
      window.xprops?.speakerId || (route.query.speakerId as string);

    const isCameraLocked = window.xprops?.isCameraLocked || false;

    const isScreenShareLocked = false;

    const sharingLink =
      window?.xprops?.sharedLink || (route.query.sharedLink as string) || '';

    const fractalUserId =
      window?.xprops?.fractalUserId ||
      (route.query.fractalUserId as string) ||
      '';

    const isCameraOn =
      window?.xprops?.isCameraOn ||
      (route.query.isCameraOn as string) === 'camera' ||
      false;

    const isMicOn =
      window?.xprops?.isMicOn ||
      (route.query.isMicOn as string) == 'micro' ||
      false;

    const isHost =
      window?.xprops?.isHost ||
      (JSON.parse((route.query.isHost as string) || 'false') as boolean);

    if (isHost) {
      window?.xprops?.setHostId?.(streamId);
    }

    const hostId =
      (window?.xprops?.hostId as string) || (route.query.hostId as string);

    let bgInfo = window?.xprops?.bgInfo || {
      url: '',
      maximized: false,
      allowResetBg: false,
    };

    if (window?.xprops?.bgInfo?.url === '' || !window?.xprops?.bgInfo?.url) {
      bgInfo = {
        url: '',
        maximized: false,
        allowResetBg: false,
      };
    }

    if (isCameraOn) {
      setVideoActivatedState(true);
      setCameraState(true);
      /* setCameraIconState(true); */
    }

    DetectRTC.load(() => {
      updateUserMe({
        hasWebcam: DetectRTC.hasWebcam,
        hasMic: DetectRTC.hasMicrophone,
      });
    });
    setUserMe({
      id: '', // updates after joined the room
      name: streamName,
      avatar,
      roleId,
      isMicOn,
      isCameraOn,
      isScreenSharing: false,
      isVideoActivated: false,
      isMicBlocked: roleId === 1 ? isMicLocked : false,
      isCameraBlocked: roleId === 1 ? isCameraLocked : false,
      isScreenShareBlocked: roleId === 1 ? isScreenShareLocked : false,
      fractalUserId,
      denied:
        roomRestriction === ROOM_PRIVACY.PRIVATE
          ? roleId === 1
            ? PERMISSION_STATUS.asked
            : PERMISSION_STATUS.admitted
          : PERMISSION_STATUS.admitted,
      isRecording: false,
      isHost,
      cameraId,
      micId,
      isPublishing: 0,
      speakerId,
      canDraw: false,
      isVideoOwner: false,
      tracks: [],
    });
    console.debug('userm', userMe);

    const startDate = window.xprops?.startDate || '2020-01-11 11:23';

    //room data
    setRoom({
      id: roomId,
      sharingLink,
      classroomId,
      roomRestriction,
      isMicBlocked: isMicLocked,
      isCameraBlocked: isCameraLocked,
      isScreenShareBlocked: isScreenShareLocked,
      bgInfo: bgInfo,
      recordingUrl: '',
      startDate,
      hostId,
    });
    onMounted(() => {
      if (roomId) {
        stablisConnection(roomId);
        setLoadingOrErrorMessage('Loading');
      } else {
        setLoadingOrErrorMessage('Please, provide a room id');
      }
    });

    //TODO: Dont dissapear loading until the host accept the user. Needed to implement logic for that (dont publish neither play streams)
    const fuCooperateMountedHandler = () => {
      if (userMe.isHost) {
        console.debug(
          'asistencia registrada (login) con el siguiente id: ',
          userMe.fractalUserId
        );
        window.xprops?.logJoined?.(userMe.fractalUserId);
      }
    };

    onUnmounted(() => {
      diconnectAll();
    });
    window.addEventListener('unload', () => {
      diconnectAll();
    });

    const handleZoidLeaveCall = () =>
      window.xprops?.handleLeaveCall?.(REASON_TO_LEAVE_ROOM.JUST_LEAVE);

    return {
      fuCooperateMountedHandler,
      roomId,
      handleZoidLeaveCall,
      ...toRefs(authState),
      ...toRefs(userMe),
      roomState,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
