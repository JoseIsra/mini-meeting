<template>
  <div class="a-imagePicker">
    <div class="a-imagePicker__label">Pantalla de fondo</div>

    <q-file
      class="a-imagePicker__picker"
      v-model="file"
      label="Insertar Imagen"
      bg-color="white"
      use-chips
      color="black"
      filled
      dense
      square
      accept=".jpg, image/*"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRoom } from '@/composables/room';
import { useInitWebRTC } from '@/composables/antMedia';
import { backBlazePath } from '@/config/constants';
import { simplifyExtension, renameFile } from '@/utils/file';
import backblazeService from '@/services/backblaze';
import { useUserMe } from '@/composables/userMe';
const { uploadFileToBackblaze } = backblazeService;

// import { renameFile } from '@/utils/file';

export default defineComponent({
  name: 'FuImagePicker',
  setup() {
    const file = ref<File | null>(null);
    const { roomState, updateBgUrl } = useRoom();
    const { sendData } = useInitWebRTC();
    const { userMe } = useUserMe();

    watch(file, async (value) => {
      if (value) {
        const fileExtension = simplifyExtension(value.type);
        const fileNameToBackblaze = `${new Date().getTime()}.${fileExtension}`;
        const newFile = renameFile(value, fileNameToBackblaze);
        const fileName = newFile.name;

        const B2Info = await window.xprops?.getB2Info?.();
        const uploadUrl = B2Info?.uploadUrl;
        const authorizationToken = B2Info?.authorizationToken;

        const b2Info = {
          uploadUrl: uploadUrl,
          authorizationToken: authorizationToken,
        };

        await uploadFileToBackblaze({
          file: new File([newFile], encodeURIComponent(fileName)),
          path: `classrooms/${roomState.classroomId}/cooperate/backgrounds`,
          b2Info,
          retries: 10,
        });

        const fileRoute = `${backBlazePath}/${roomState.classroomId}/cooperate/backgrounds/${fileName}`;

        updateBgUrl(
          fileRoute ||
            'https://www.fcbarcelona.com/photo-resources/2021/08/09/c4f2dddd-2152-4b8b-acf8-826b4377e29d/Camp-Nou-4.jpg?width=1200&height=750'
        );

        sendData(userMe.id, {
          eventType: 'UPDATE_ROOM_BG',
          url: fileRoute,
        });

        window.xprops?.setBackgroundInfo?.(
          fileRoute,
          roomState.bgInfo.maximized
        );
      } else {
        updateBgUrl(
          'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png'
        );

        sendData(userMe.id, {
          eventType: 'UPDATE_ROOM_BG',
          url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
        });

        window.xprops?.setBackgroundInfo?.(
          'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
          roomState.bgInfo.maximized
        );
      }
    });

    return {
      file,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './imagePicker.scss';
</style>
