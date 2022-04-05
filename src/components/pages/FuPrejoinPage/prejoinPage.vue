<template>
  <q-dialog v-model="show" persistent full-height full-width>
    <fu-t-prejoin-page
      :name="name"
      class="p-cooperateLobby"
      :with-name="withName"
      @submit="joinCollaborate"
    >
      <template #top>
        <img
          class="p-cooperateLobby__logo"
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg"
        />
      </template>
      <template #bottom="{ loading }">
        <div class="p-cooperateLobby__buttonCreateGroup">
          <q-btn
            unelevated
            rounded
            color="grey-1"
            text-color="black"
            padding="5px 70px"
            label="Regresar"
            no-caps
            @click="back"
          />
          <q-btn
            unelevated
            rounded
            padding="5px 70px"
            type="submit"
            :loading="loading"
            label="Ingresar"
            no-caps
            class="p-cooperateLobby__buttonCreateGroup --initBtn q-mt-md"
          />
        </div>
      </template>
    </fu-t-prejoin-page>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import FuTPrejoinPage from 'templates/FuPrejoinPage';

export default defineComponent({
  name: 'FuPrejoinPage',
  components: { FuTPrejoinPage },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const show = ref(true);
    const withName = ref(window.xprops?.isVisitor || true);
    const name = ref('');
    const isHost =
      window?.xprops?.isHost ||
      (JSON.parse((route.query.isHost as string) || 'false') as string);

    const roleId = window.xprops?.roleId || route.query.roleId || '1';

    const back = () => {
      window.xprops?.handleParticipantLeave();
    };

    const joinCollaborate = (name: string) => {
      void router.push({
        name: 'meet',
        query: {
          roomId: 'chernobil',
          streamName: name,
          isHost: isHost as string,
          roleId: roleId,
        },
      });
    };

    return {
      show,
      back,
      name,
      joinCollaborate,
      withName,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './prejoinPage.scss';
</style>
