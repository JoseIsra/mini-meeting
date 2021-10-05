/* eslint-disable @typescript-eslint/no-unsafe-return */
<template>
  <div class="o-cooperate-board">
    <canvas id="board" width="750" height="500"></canvas>

    <q-btn
      :label="drawingMode ? 'Desactivar Dibujar' : 'Activar Dibujar'"
      @click="toggleDrawingMode"
    />

    <q-btn label="Limpiar" @click="clearBoard" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
// import { FabricCanvas } from '@/types/fabric';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'FuBoard',
  setup() {
    const drawingMode = ref(false);

    const canvasref = ref<HTMLCanvasElement | null>(null);
    const context = ref<CanvasRenderingContext2D | null>(null);

    onMounted(() => {
      // context.value = canvasref.value?.getContext('2d') ?? null;

      const canvas = new fabric.Canvas('board');

      // canvasref.value = new fabric.Canvas('board');

      canvasref.value?.addEventListener(
        'object:added',
        (value) => {
          console.log(value);
        },
        false
      );

      context.value = canvas.getContext('2d');

      console.log(context.value);

      // canvasRef.value.setDimensions({width: 750, height:  500});
      // canvasRef.value?.backgroundColor  = '#fff';
      // const canvasProperties = {width:750, height:500}
      // const currentCanvas = {json: JSON.parse(canvasRef.value), canvas: canvasProperties};
      // new CanvasHistory(canvasRef.value, currentCanvas);

      var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 20,
        height: 20,
      });

      // canvasref.value.add();

      canvas.add(rect);

      canvas.on('object:added', (options: unknown) => {
        console.log('Added: ', options);
      });

      canvas.on('object:removed', (options: unknown) => {
        console.log('Removed: ', options);
      });

      canvas.isDrawingMode = true;
      // canvasref.value.isDrawingMode = true;

      console.log(rect);
    });

    const toggleDrawingMode = () => {
      drawingMode.value = !drawingMode.value;
      // canvasref.value.isDrawingMode = drawingMode.value;
    };

    const clearBoard = () => {
      console.log('Limpiar pizarra');
      // const canvas = document.getElementById('whiteboard');
      // canvas.clear();
    };

    return {
      // canvas,
      drawingMode,
      // clearBoard,
      toggleDrawingMode,
      clearBoard,
    };
  },
});
</script>

<style lang="scss">
@import './cooperateBoard.scss';
</style>
