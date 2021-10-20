<template>
  <div
    class="a-fileCatcher"
    @dragenter.prevent="onDragEnter;"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent.stop="onDrop"
  >
    <input
      ref="holymoly"
      class="a-fileCatcher__imagePicker"
      type="file"
      @change.prevent="previewFiles"
    />

    <div class="a-fileCatcher__inputReplace">
      <div
        v-if="!inputState || Boolean(defaultImage)"
        :class="['a-fileCatcher__nameFile', { '-preview': showPreview }]"
      >
        <div class="a-fileCatcher__previewWrapper">
          <img
            v-show="showPreview || imagePreviewProp != ''"
            ref="image"
            class="a-fileCatcher__imagePreview"
            :src="previewImage != '' ? previewImage : imagePreviewProp"
            alt="Preview image"
            @error="errorLoadImage"
          />

          <img
            v-show="
              !showPreview && Boolean(defaultImage) && imagePreviewProp == ''
            "
            class="a-fileCatcher__imageDefault"
            :src="defaultImage"
            alt="Default image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs } from 'vue';
import { simplifyExtension, isFileImage } from '@/utils/file';

export default defineComponent({
  name: 'FuFileCatcherCooperate',
  props: {
    defaultImage: {
      type: String,
      default:
        'https://f002.backblazeb2.com/file/FractalUp/Logos/logo_azul.svg',
    },
    imagePreviewProp: {
      type: String,
      default: '',
    },
    validFiles: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const inputState = ref(true);
    let selectNameFile = ref('');
    const isDragging = ref(false);
    const dragCount = ref(0);
    const showPreview = ref(false);
    const previewImage = ref('');
    const errorLoad = ref(false);
    const inputFile = ref<File | null>({} as File);

    //****************COMPUTEDS*****************+ */
    const isImageFile = computed(() => {
      if (typeof inputFile.value !== 'object') return false;
      return isFileImage(inputFile.value as File);
    });

    //***********************METHODS*/

    const errorLoadImage = () => {
      if (props.imagePreviewProp !== '') {
        errorLoad.value = true;
      }
    };

    const onDragEnter = () => {
      dragCount.value += 1;
      isDragging.value = true;
      return false;
    };

    const onDragLeave = () => {
      dragCount.value -= 1;
      if (dragCount.value <= 0) isDragging.value = false;
    };

    const assignFile = (event: DragEvent) => {
      inputFile.value = event.dataTransfer?.files[0] as File;
      selectNameFile.value = inputFile?.value?.name;
    };

    const createPreview = () => {
      if (isImageFile.value) {
        previewImage.value = URL.createObjectURL(inputFile.value);
        errorLoad.value = false;
        showPreview.value = true;
      } else {
        showPreview.value = false;
        previewImage.value = '';
      }
    };

    const onDrop = (event: DragEvent) => {
      dragCount.value -= 1;
      inputState.value = false;
      isDragging.value = false;
      if (
        Number(event?.dataTransfer?.files?.length) > 0 &&
        isValidFile(event?.dataTransfer?.files[0] as File)
      ) {
        assignFile(event);
        createPreview();
        console.log('soltando archivo bien chido');
      } else {
        console.log('NO es archivo valido soltado perro');
      }
    };

    // const cleanPreview = () => {
    //   inputFile.value = null;
    //   selectNameFile.value = '';
    // };

    // const restoreValue = () => {
    //   showPreview.value = false;
    //   inputFile.value = null;
    //   selectNameFile.value = '';
    //   previewImage.value = '';
    //   errorLoad.value = false;
    // };

    const isValidFile = (inputFile: File) => {
      return (
        props.validFiles.length === 0 ||
        props.validFiles.includes(simplifyExtension(inputFile.type))
      );
    };

    const previewFiles = (event: { target: HTMLInputElement }) => {
      console.log('sae');
      if (
        Number(event?.target?.files?.length) > 0 &&
        isValidFile(event?.target?.files?.[0] as File)
      ) {
        inputFile.value = event?.target?.files?.[0] as File;
        selectNameFile.value = inputFile.value.name;
        console.log('se tiene un file bro');
      } else {
        console.log('no es valido carnal 😆');
      }
    };

    return {
      previewFiles,
      inputFile,
      onDrop,
      onDragEnter,
      onDragLeave,
      previewImage,
      showPreview,
      ...toRefs(props),
      errorLoad,
      errorLoadImage,
      inputState,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fileCatcherCooperate.scss';
</style>
