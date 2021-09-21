<template>
  <section class="m-sharedStream">
    <fu-shared-stream-content
      :sharedLink="sharedLink"
      :unCopyText="unCopyText"
      @copy-shared-link="copySharedLink"
      @close-room-info-card="closeRoomInfoCard"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FuSharedStreamContent from 'atoms/FuSharedStreamContent';
import { useToogleFunctions } from '@/composables';

export default defineComponent({
  name: 'FuMRecording',
  components: { FuSharedStreamContent },
  props: {
    sharedLink: {
      type: String,
      default: 'sharedLink',
    },
  },
  setup() {
    let unCopyText = ref(false);
    const { watchInfoRoomCard } = useToogleFunctions();
    const copySharedLink = (sharedLinkCopied: string) => {
      navigator.clipboard
        .writeText(sharedLinkCopied)
        .then(() => {
          unCopyText.value = true;
          let thetime = setTimeout(() => {
            unCopyText.value = false;
          }, 2000);
          () => clearTimeout(thetime);
        })
        .catch((err) => console.log(err));
    };

    const closeRoomInfoCard = () => {
      watchInfoRoomCard(false);
    };

    return {
      copySharedLink,
      unCopyText,
      closeRoomInfoCard,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './sharedStream.scss';
</style>
