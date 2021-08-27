<template>
  <section class="o-cooperate">
    <header class="o-cooperate__header">
      <figure class="o-cooperate__header__logo">
        <img
          class="o-cooperate__header__logo__image"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/LogoFU_head.svg"
          alt="logo-collaborate"
        />
      </figure>
    </header>
    <main class="o-cooperate__screen">
      <figure class="o-cooperate__screen__imgBox">
        <img
          class="o-cooperate__screen__imgBox__image"
          alt="fractalitos"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png"
        />
      </figure>
    </main>
    <div class="o-cooperate__menuBar">
      <aside class="o-cooperate__menuBar__periferics">
        <q-btn
          flat
          round
          :class="['o-cooperate__menuBar__icon', { active: icon.active }]"
          v-for="icon in iconsLeft"
          :key="icon.id"
          :icon="icon.active ? icon.onState : icon.offState"
          size="14px"
          @click="icon.active = !icon.active"
        >
          <q-tooltip class="bg-grey-10">
            <label class="o-cooperate__menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </aside>
      <div class="o-cooperate__menuBar__functions">
        <q-btn
          flat
          round
          v-for="icon in iconsMiddle"
          :class="['o-cooperate__menuBar__icon', { active: icon.active }]"
          :key="icon.id"
          :icon="icon.onState"
          size="14px"
          @click="icon.active = !icon.active"
        >
          <q-tooltip class="bg-grey-10">
            <label class="o-cooperate__menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </div>
      <aside class="o-cooperate__menuBar__options">
        <q-btn
          round
          flat
          :ripple="false"
          v-for="icon in iconsRight"
          :key="icon.id"
          :icon="icon.onState"
          class="o-cooperate__menuBar__icon"
          size="14px"
        >
          <q-tooltip class="bg-grey-10">
            <label class="o-cooperate__menuBar__icon__tooltip">
              {{ icon.toolTipMessage }}
            </label>
          </q-tooltip>
        </q-btn>
      </aside>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  iconsLeftPosition,
  iconsMiddlePosition,
  iconsRightPosition,
} from '@/helpers/iconsMenuBar';
interface Icons {
  id: string;
  onState: string;
  offState: string;
  active: boolean;
  toolTipMessage: string;
}

export default defineComponent({
  name: 'FuCooperate',
  setup() {
    const iconsLeft = ref<Icons[]>(iconsLeftPosition);
    const iconsMiddle = ref<Icons[]>(iconsMiddlePosition);
    const iconsRight = ref<Icons[]>(iconsRightPosition);

    return {
      iconsLeft,
      iconsMiddle,
      iconsRight,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './cooperate.scss';
</style>
