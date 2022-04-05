<template>
  <section class="m-generalPanel">
    <fieldset class="m-generalPanel__linkBox">
      <legend class="m-generalPanel__linkBox__text --mainTitle">
        Enlace de la sala
      </legend>
      <p class="m-generalPanel__linkBox__text --subTitle">
        Puedes compartir este enlace de la sala con las personas que quieras que
        se unan
      </p>
      <div class="m-generalPanel__linkBox__actions">
        <p class="m-generalPanel__linkBox__actions__link">
          {{ sharedRoomLink }}
        </p>
        <q-btn
          no-caps
          push
          :class="[
            'm-generalPanel__linkBox__actions__copyBtn',
            { '--copied': linkCopied },
          ]"
          :label="linkCopied ? 'Enlace copiado' : 'Copiar enlace'"
          @click="copySharedLink"
        />
      </div>
    </fieldset>
    <fieldset class="m-generalPanel__externalVideo">
      <legend class="m-generalPanel__externalVideo__text --mainTitle">
        Video externo
      </legend>
      <fu-external-video-modal />
    </fieldset>
    <!-- <fieldset class="m-generalPanel__bgBox">
      <legend class="m-generalPanel__bgBox__text --mainTitle">
        Fondo de Cooperate
      </legend>
      <fu-file-catcher-cooperate @file-dropped="fileWasDroppped" />
      <div class="m-generalPanel__bgBox__fileInfo" v-show="tempFileName">
        <p class="m-generalPanel__bgBox__fileInfo__name">
          {{ fileNameDroppedMessage }}
        </p>
        <q-btn
          :loading="isLoading"
          push
          label="Cargar imagen"
          class="m-generalPanel__bgBox__btn --fileBtn"
          @click="changeBgImage"
        >
          <template v-slot:loading>
            <q-spinner-hourglass color="blue-6" size="30px" />
            Procesando...
          </template>
        </q-btn>
      </div>
      <div class="m-generalPanel__bgBox__actions">
        <q-checkbox
          v-model="maximizeBg"
          label="Maximizar fondo de pantalla"
          dense
          dark
          class="m-generalPanel__bgBox__actions__check"
          left-label
          color="primary"
        />
        <p class="m-generalPanel__bgBox__actions__hint">
          La imagen de fondo ocupa todo el alto y ancho de la pantalla
        </p>
        <q-btn
          push
          class="m-generalPanel__bgBox__btn --reset"
          :class="{ '--off': !roomState.bgInfo.allowResetBg }"
          label="Restablecer fondo de pantalla"
          :disable="!roomState.bgInfo.allowResetBg"
          @click="resetCooperateBg"
        />
      </div>
    </fieldset> -->
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, computed, watch } from 'vue';

import { useInitWebRTC, useRoom } from '@/composables';
// import FuFileCatcherCooperate from 'atoms/FuFileCatcherCooperate';
import { backBlazePath } from '@/config/constants';
import { simplifyExtension, renameFile } from '@/utils/file';
import backblazeService from '@/services/backblaze';
import { errorMessage, successMessage } from '@/utils/notify';
const { uploadFileToBackblaze } = backblazeService;
import FuExternalVideoModal from 'molecules/FuExternalVideoModal';

export default defineComponent({
  name: 'FuGeneralPanel',
  components: {
    // FuFileCatcherCooperate,
    FuExternalVideoModal,
  },
  setup() {
    const { roomState, updateBgUrl, updateBgSize, updateAllowResetBg } =
      useRoom();
    const maximizeBg = ref(roomState.bgInfo.maximized);
    const linkCopied = ref(false);
    let fileToChangeBg = ref({} as File);
    let tempFileName = ref('');
    const { sendData } = useInitWebRTC();
    const isLoading = ref(false);

    //*******COMPUTEDSSS */
    const sharedRoomLink = computed(() => {
      return roomState.sharingLink || 'https://localhost:8081/';
    });

    const fileNameDroppedMessage = computed(
      () => `Imagen: ${tempFileName.value}`
    );

    //*******************METHODS  */
    const copyingLink = () => {
      navigator.clipboard
        .writeText(sharedRoomLink.value)
        .then(() => {
          linkCopied.value = true;
          let thetime = setTimeout(() => {
            linkCopied.value = false;
          }, 2000);
          () => clearTimeout(thetime);
        })
        .catch((err) => console.error(err));
    };

    const copySharedLink = () => {
      linkCopied.value = !linkCopied.value;
      copyingLink();
    };

    const fileWasDroppped = (fileDropped: File) => {
      fileToChangeBg.value = fileDropped;
      tempFileName.value = fileDropped.name;
    };

    const changeBgImage = async () => {
      isLoading.value = true;
      const fileExtension = simplifyExtension(fileToChangeBg.value.type);
      const fileNameToBackblaze = `${new Date().getTime()}.${fileExtension}`;
      const newFile = renameFile(fileToChangeBg.value, fileNameToBackblaze);
      const fileName = newFile.name;

      const B2Info = await window.xprops?.getB2Info?.();
      const uploadUrl = B2Info?.uploadUrl;
      const authorizationToken = B2Info?.authorizationToken;

      const b2Info = {
        uploadUrl: uploadUrl,
        authorizationToken: authorizationToken,
      };
      try {
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
        updateAllowResetBg(true);
        sendData(roomState.hostId, {
          eventType: 'UPDATE_ROOM_BG',
          url: fileRoute,
        });
        isLoading.value = false;
        window.xprops?.setBackgroundInfo?.(
          fileRoute,
          roomState.bgInfo.maximized
        );
        successMessage('Fondo de pantalla cambiado');
      } catch (error) {
        console.log(error);
        errorMessage('No se pudo cargar la imagen');
      }
    };

    watch(maximizeBg, (value) => {
      sendData(roomState.hostId, {
        eventType: 'UPDATE_ROOM_SIZE',
        maximized: value,
      });

      updateBgSize(value);

      window.xprops?.setBackgroundInfo?.(roomState.bgInfo.url, value);
    });

    const resetCooperateBg = () => {
      updateBgUrl(
        'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png'
      );

      sendData(roomState.hostId, {
        eventType: 'UPDATE_ROOM_BG',
        url: 'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
      });

      window.xprops?.setBackgroundInfo?.(
        'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png',
        roomState.bgInfo.maximized
      );
      updateAllowResetBg(false);
      successMessage('Fondo de pantalla cambiado');
    };

    return {
      maximizeBg,
      ...toRefs(roomState),
      sharedRoomLink,
      copySharedLink,
      linkCopied,
      fileWasDroppped,
      fileNameDroppedMessage,
      changeBgImage,
      tempFileName,
      roomState,
      resetCooperateBg,
      isLoading,
    };
  },
});
</script>

<style scoped lang="scss">
@import './generalPanel.scss';
</style>
