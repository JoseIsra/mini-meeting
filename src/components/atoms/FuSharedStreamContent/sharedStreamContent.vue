<template>
  <section class="m-shared">
    <header class="m-shared__head">
      <h4 class="m-shared__head__message">Sala creada</h4>
      <q-btn
        icon="close"
        color="white"
        round
        flat
        dense
        @click="closeInfoRoomCard"
      />
    </header>
    <main class="m-shared__body">
      <p class="m-shared__body__message">
        Puedes compartir este enlace de la sala con las personas que quieras que
        se unan
      </p>
      <div class="m-shared__body__inputBox">
        <input
          ref="inputtarget"
          readonly
          :value="sharedLinkOnInput"
          class="m-shared__body__input"
        />
        <q-btn
          icon="content_copy"
          round
          push
          color="white"
          text-color="blue"
          :ripple="false"
          class="m-shared__body__copyBtn"
          @click="copySharedLink"
        >
          <q-tooltip
            :class="[unCopyText ? 'bg-primary' : 'bg-grey-10']"
            transition-show="rotate"
            transition-hide="rotate"
          >
            <label class="m-shared__body__copyBtn__label">
              {{ toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </div>
    </main>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'FuSharedStreamContent',
  props: {
    sharedLink: {
      type: String,
    },
    unCopyText: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    let sharedLinkOnInput = ref(props.sharedLink);

    const toolTipMessage = computed(() => {
      return props.unCopyText ? 'Enlace copiado' : 'Copiar enlace';
    });

    const copySharedLink = () => {
      emit('copy-shared-link', sharedLinkOnInput.value);
    };
    const closeInfoRoomCard = () => {
      emit('close-room-info-card');
    };
    return {
      sharedLinkOnInput,
      copySharedLink,
      toolTipMessage,
      closeInfoRoomCard,
    };
  },
});
</script>

<style lang="scss">
@import './sharedStreamContent.scss';
</style>
