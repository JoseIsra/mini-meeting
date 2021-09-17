<template>
  <section class="m-sharedStream">
    <fu-shared-stream-content
      :sharedLink="sharedLink"
      :unCopyText="unCopyText"
      @copy-shared-link="copySharedLink"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FuSharedStreamContent from 'atoms/FuSharedStreamContent';

export default defineComponent({
  name: 'FuMRecording',
  components: { FuSharedStreamContent },
  props: {
    sharedLink: {
      type: String,
    },
  },
  setup() {
    let unCopyText = ref(false);

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
    return {
      copySharedLink,
      unCopyText,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './sharedStream.scss';
</style>
