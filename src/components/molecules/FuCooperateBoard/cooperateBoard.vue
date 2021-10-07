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

<script>
import { defineComponent, ref, onMounted } from 'vue';
// import { FabricCanvas } from '@/types/fabric';
import { fabric } from 'fabric';

export default defineComponent({
  name: 'FuBoard',
  setup() {
    const drawingMode = ref(false);

    // const canvasref = ref<HTMLCanvasElement | null>(null);
    // const context = ref<CanvasRenderingContext2D | null>(null);

    const canvas = ref(null);
    // const context = ref(null);

    onMounted(() => {
      // const canvas = new fabric.Canvas('board');

      canvas.value = new fabric.Canvas('board');

      // context.value = canvasref.value.getContext('2d');

      // canvasref.value.addEventListener(
      //   'object:added',
      //   (value) => {
      //     console.log(value);
      //   },
      //   false
      // );

      // context.value = canvas.getContext('2d');
      // console.log(context.value);

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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      canvas.value.add(rect);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      canvas.value.on('object:added', (options) => {
        console.log('Added: ', options);
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      canvas.value.on('object:removed', (options) => {
        console.log('Removed: ', options);
      });

      canvas.value.isDrawingMode = true;
      // canvasref.value.isDrawingMode = true;

      console.log(rect);
    });

    const toggleDrawingMode = () => {
      drawingMode.value = !drawingMode.value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      canvas.value.isDrawingMode = drawingMode.value;
    };

    const clearBoard = () => {
      console.log('Limpiar pizarra');
      // const canvas = document.getElementById('whiteboard');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      canvas.value.clear();
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
