<template>
  <div
    class="a-fileCatcher"
    @dragenter.prevent="onDragEnter;"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent.stop="onDrop"
    v-on="$q.screen.lt.sm ? { click: dosomShit } : {}"
  >
    <input
      type="file"
      :style="{ display: 'none' }"
      ref="holymoly"
      @change="previewFiles"
    />
    <div class="a-fileCatcher__previewWrapper" :style="previewImageBackground">
      <img
        v-show="!showPreview"
        class="a-fileCatcher__imageDefault"
        :src="defaultImage"
        alt="Default image"
        spinner-color="white"
      />
    </div>
    <p v-show="!showPreview" class="a-fileCatcher__hint">
      Arrastra tu imagen preferida
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs } from 'vue';
import { simplifyExtension, isFileImage } from '@/utils/file';
import { errorMessage } from '@/utils/notify';

export default defineComponent({
  name: 'FuFileCatcherCooperate',
  props: {
    defaultImage: {
      type: String,
      default:
        'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/classroom/file.png',
    },
    imagePreviewProp: {
      type: String,
      default: '',
    },
    validFiles: {
      type: Array,
      default: () => ['jpg', 'png', 'jpeg'],
    },
  },
  setup(props, { emit }) {
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

    const previewImageBackground = computed(() =>
      showPreview.value
        ? {
            '--bg': `url('${previewImage.value}')`,
          }
        : ''
    );

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
        emit('file-dropped', inputFile.value);
      } else {
        errorMessage('No es un tipo de archivo válido');
      }
    };

    const isValidFile = (inputFile: File) => {
      return (
        props.validFiles.length === 0 ||
        props.validFiles.includes(simplifyExtension(inputFile.type))
      );
    };

    const previewFiles = (event: { target: HTMLInputElement }) => {
      console.log('INPUT TYPE ON MOBILE', event.target.files);
      // if (
      //   Number(event?.target?.files?.length) > 0 &&
      //   isValidFile(event?.target?.files?.[0] as File)
      // ) {
      //   inputFile.value = event?.target?.files?.[0] as File;
      //   selectNameFile.value = inputFile.value.name;
      //   createPreview();
      //   emit('file-dropped', inputFile.value);
      // } else {
      //   console.log('nica');
      // }
    };

    const dosomShit = () => {
      console.log('alo click den boton');
    };
    return {
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
      previewImageBackground,
      previewFiles,
      dosomShit,
    };
  },
});
</script>

<style scoped lang="scss">
@import './fileCatcherCooperate.scss';
</style>
