<template>
  <div>
    <fu-prejoin-page
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
    </fu-prejoin-page>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FuPrejoinPage from 'organisms/FuPrejoinPage';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FuTPrejoinPage',
  components: { FuPrejoinPage },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const show = ref(true);
    const withName = ref(window.xprops?.isVisitor || false);
    const name =
      window?.xprops?.streamName || (route.query.streamName as string) || '';

    const back = () => {
      window.xprops?.handleParticipantLeave();
    };

    const roomId =
      window?.xprops?.roomId || (route.query.roomId as string) || '';

    const joinCollaborate = (name: string) => {
      void router.push({
        name: 'meet',
        query: {
          roomId: roomId,
          streamName: name,
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
