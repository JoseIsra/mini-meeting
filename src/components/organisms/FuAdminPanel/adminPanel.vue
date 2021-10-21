<template>
  <q-card class="o-panel">
    <q-card-section class="o-panel__body" tag="div">
      <q-card-section
        horizontal
        :class="[
          'o-panel__body__options',
          { '--optionsResponsive': $q.screen.lt.sm },
          { '--slideLeft': moveToLeft && $q.screen.lt.sm },
        ]"
      >
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
      <q-card-section
        tag="aside"
        :class="[
          'o-panel__body__contentOptions',
          { '--responsiveContentOptions': $q.screen.lt.sm },
          { '--slideRight': moveToLeft && $q.screen.lt.sm },
        ]"
      >
        <q-btn
          no-caps
          v-show="$q.screen.lt.sm"
          label="Volver"
          flat
          dense
          icon="chevron_left"
          class="o-panel__body__contentOptions__responsiveBtn --goBack"
          @click="returnToPanelOptions"
        />
        <div class="o-panel__body__contentOptions__surfaceContainer">
          <div class="o-panel__body__contentOptions__innerContainer">
            <keep-alive>
              <component
                v-for="compo in componentList"
                :key="compo.id"
                :is="compo.name"
                v-show="compo.respondToOption == panelSelected.description"
              ></component>
            </keep-alive>
          </div>
        </div>
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
    const moveToLeft = ref(false);
    const moveToRight = ref(false);

    const selectPanel = (panel: Options) => {
      panelSelected.value = panel;
      moveToLeft.value = !moveToLeft.value;
      // moveToRight.value = true;
    };

    const returnToPanelOptions = () => {
      moveToLeft.value = !moveToLeft.value;
    };

    return {
      panelOptions,
      activePanel,
      selectPanel,
      panelSelected,
      mycomponents,
      componentList,
      moveToLeft,
      moveToRight,
      returnToPanelOptions,
    };
  },
});
</script>

<style scoped lang="scss">
@import './adminPanel.scss';
</style>
