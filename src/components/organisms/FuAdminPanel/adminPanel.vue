<template>
  <q-card class="o-panel">
    <q-card-section class="o-panel__body" tag="div">
      <q-card-section horizontal class="o-panel__body__options">
        <ul class="o-panel__body__options__container">
          <li
            v-for="panel in panelOptions"
            :class="[
              'o-panel__body__options__option',
              { '--active': panel.id == panelSelected.id },
            ]"
            :key="panel.id"
            @click="selectPanel(panel)"
          >
            <q-icon :name="panel.iconName" color="white" size="25px" />
            <p class="o-panel__body__options__option__name">
              {{ panel.description }}
            </p>
          </li>
        </ul>
      </q-card-section>
      <q-card-section tag="aside" class="o-panel__body__contentOptions">
        <component
          v-for="compo in componentList"
          :key="compo.id"
          :is="compo.name"
          v-show="compo.respondToOption == panelSelected.description"
        ></component>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  adminPanelOptions,
  Options,
  componentList,
} from '@/helpers/menuOptions';
import FuGeneralPanel from 'molecules/FuGeneralPanel';
import FuParticipantPerifericPanel from 'molecules/FuParticipantPerifericPanel';

interface List {
  id: string;
  name: string;
  respondToOption: string;
}

export default defineComponent({
  name: 'FuAdminPanel',
  components: { FuGeneralPanel, FuParticipantPerifericPanel },
  setup() {
    const panelOptions = ref<Options[]>(adminPanelOptions);
    const mycomponents = ref<List[]>(componentList);

    const activePanel = ref(false);
    const panelSelected = ref(panelOptions.value[0]);

    const selectPanel = (panel: Options) => {
      panelSelected.value = panel;
    };

    return {
      panelOptions,
      activePanel,
      selectPanel,
      panelSelected,
      mycomponents,
      componentList,
    };
  },
});
</script>

<style scoped lang="scss">
@import './adminPanel.scss';
</style>
