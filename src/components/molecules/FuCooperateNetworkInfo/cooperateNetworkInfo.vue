<template>
  <q-card class="m-network">
    <q-card-section tag="header" class="m-network__header">
      <h3 class="m-network__header__title">
        <strong>Estado de la conexión</strong>
      </h3>
      <label class="m-network__header__subtitle">
        Ver el estado de conexión de los demás usuarios
      </label>
    </q-card-section>
    <q-card-section tag="div" class="m-network__content">
      <p>
        Si está experimentando fallas de conexión, modifique las opciones
        mostradas
      </p>
      <div class="m-network__content__options">
        <aside class="m-network__content__options__option">
          <lable>Cámara Web</lable>
          <q-toggle
            color="blue"
            :label="cameraModel"
            false-value="Habilitar"
            true-value="Deshabilitar"
            v-model="cameraModel"
          />
        </aside>
        <aside class="m-network__content__options__option">
          <lable>Pantalla compartida</lable>
          <q-toggle
            color="blue"
            :label="screenModel"
            false-value="Habilitar"
            true-value="Deshabilitar"
            v-model="screenModel"
          />
        </aside>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'FuCooperateNetworkInfo',
  setup() {
    let cameraModel = ref(true);
    let screenModel = ref(true);

    return {
      cameraModel,
      screenModel,
    };
  },
});
</script>

<style scoped lang="scss">
@import './cooperateNetworkInfo.scss';
</style>
