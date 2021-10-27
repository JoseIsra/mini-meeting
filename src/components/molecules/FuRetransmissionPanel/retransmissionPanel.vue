<template>
  <section class="m-retransmission">
    <q-tabs
      v-model="tab"
      dense
      class="m-retransmission__tabs"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      no-caps
    >
      <q-tab name="facebook" class="m-retransmission__tabs__tab">
        Transmitir
        <br />
        en Facebook
      </q-tab>
      <q-tab name="youtube" class="m-retransmission__tabs__tab">
        Transmitir <br />
        en Youtube
      </q-tab>
      <q-tab name="rtmp" class="m-retransmission__tabs__tab">
        Transmitir <br />
        usando RTMP
      </q-tab>
    </q-tabs>

    <q-tab-panels
      v-model="tab"
      animated
      transition-prev="scale"
      transition-next="scale"
      class="m-retransmission__tabs__panels"
    >
      <q-tab-panel
        v-for="(nameTab, index) in nameTabs"
        :key="index"
        :name="nameTab"
      >
        <fu-retransmission-content :streamService="tab" />
      </q-tab-panel>
    </q-tab-panels>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FuRetransmissionContent from 'molecules/FuRetransmissionContent';

export default defineComponent({
  name: 'FuRetransmissionPanel',
  components: { FuRetransmissionContent },
  setup() {
    const tab = ref('facebook');
    const nameTabs = ref(['facebook', 'youtube', 'rtmp']);
    return {
      tab,
      nameTabs,
    };
  },
});
</script>

<style scoped lang="scss">
@import './retransmissionPanel.scss';
</style>
