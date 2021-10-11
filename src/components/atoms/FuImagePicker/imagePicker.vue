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

export default defineComponent({
  name: 'FuImagePicker',
  setup() {
    const file = ref<File | null>(null);

    watch(file, (value) => {
      if (value) {
        console.log('Se subio una imagen');
        console.log(value);
        // Llamada al backblaze y actualizacion del fondo para todos y para el usuario
        // EVENT_TYPE: UPDATE_ROOM_BG
        updateBgUrl(
          'https://www.fcbarcelona.com/photo-resources/2021/08/09/c4f2dddd-2152-4b8b-acf8-826b4377e29d/Camp-Nou-4.jpg?width=1200&height=750'
        );
      } else {
        updateBgUrl(
          'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png'
        );
      }
    });

    const { updateBgUrl } = useRoom();

    return {
      file,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './imagePicker.scss';
</style>
