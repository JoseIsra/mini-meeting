<template>
  <section class="m-generalPanel">
    <fieldset class="m-generalPanel__linkBox">
      <legend class="m-generalPanel__linkBox__text --mainTitle">
        Enlace de la sala
      </legend>
      <!-- <p class="m-generalPanel__linkBox__text --mainTitle">Enlace de la sala</p> -->
      <p class="m-generalPanel__linkBox__text --subTitle">
        Puedes compartir este enlace de la sala con las personas que quieras que
        se unan
      </p>
      <div class="m-generalPanel__linkBox__actions">
        <p class="m-generalPanel__linkBox__actions__link">
          {{ linkToShareWithYourHommies }}
        </p>
        <q-btn
          no-caps
          :class="[
            'm-generalPanel__linkBox__actions__copyBtn',
            { '--copied': linkCopied },
          ]"
          :label="linkCopied ? 'Enlace copiado' : 'Copiar enlace'"
          @click="copySharedLink"
        />
      </div>
    </fieldset>
    <fieldset class="m-generalPanel__bgBox">
      <legend class="m-generalPanel__bgBox__text --mainTitle">
        Pantalla de fondo
      </legend>
      <!-- COMPONTE FILE CATCHER-->
      <fu-file-catcher-cooperate />

      <div class="m-generalPanel__bgBox__actions">
        <q-checkbox
          v-model="bgActive"
          label="Maximizar fondo de pantalla"
          dense
          dark
          class="m-generalPanel__bgBox__actions__check"
          left-label
          color="primary"
        />
        <p class="m-generalPanel__bgBox__actions__hint">
          Mensaje referente para hacer crecer la imagen...
        </p>
      </div>
    </fieldset>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, computed } from 'vue';
import { useRoom } from '@/composables/room';
import FuFileCatcherCooperate from 'atoms/FuFileCatcherCooperate';

export default defineComponent({
  name: 'FuGeneralPanel',
  components: { FuFileCatcherCooperate },
  setup() {
    const bgActive = ref(false);
    const { roomState } = useRoom();
    const linkCopied = ref(false);

    const linkToShareWithYourHommies = computed(() => {
      return roomState.sharingLink || 'https://localhost:8081/?roomId=room5';
    });

    const copyingLink = () => {
      navigator.clipboard
        .writeText(linkToShareWithYourHommies.value)
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

    return {
      bgActive,
      ...toRefs(roomState),
      linkToShareWithYourHommies,
      copySharedLink,
      linkCopied,
    };
  },
});
</script>

<style scoped lang="scss">
@import './generalPanel.scss';
</style>
