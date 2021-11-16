<template>
  <q-card class="m-config">
    <q-card-section tag="header" class="m-config__head">
      <h6 class="m-config__head__text">Configuración de dispositivos</h6>
    </q-card-section>
    <q-card-section class="m-config__body" tag="div">
      <div class="m-config__body__periferics">
        <p class="m-config__body__periferics__title">Mis dispositivos</p>
        <div class="m-config__body__periferics__box --micro">
          <p class="m-config__body__periferics__box__label">Microfonos</p>
          <q-btn-dropdown color="primary" flat rounded :label="getMicLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getAudioDevices"
                :key="device.deviceId"
                @click="selectNewMicrophone(device)"
              >
                <q-item-section>
                  <q-item-label>{{ device.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <!-- <div class="m-config__body__periferics__box --micro">
          <p class="m-config__body__periferics__box__label">Salidas de audio</p>
          <q-btn-dropdown color="primary" flat rounded :label="getSpeakerLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getAudioOuputDevices"
                :key="device.deviceId"
                @click="selectNewSpeaker(device)"
              >
                <q-item-section>
                  <q-item-label>{{ device.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div> -->
        <div class="m-config__body__periferics__box --camera">
          <p class="m-config__body__periferics__box__label">Cámaras</p>
          <q-btn-dropdown color="primary" flat rounded :label="getCameraLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getVideoDevices"
                :key="device.deviceId"
                @click="selectNewCamera(device)"
              >
                <q-item-section>
                  <q-item-label>{{ device.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useInitWebRTC, useUserMe, usePerifericsControls } from '@/composables';

export default defineComponent({
  setup() {
    const audioDevices = ref<MediaDeviceInfo[]>([]);
    const videoDevices = ref<MediaDeviceInfo[]>([]);
    const { userMe, updateUserMe } = useUserMe();
    const { switchAudioInputSource, switchVideoCameraCapture } =
      useInitWebRTC();

    const { userDevicesDetected } = usePerifericsControls();

    const getMicLabel = computed(() => {
      return (
        getAudioDevices.value.find((device) => device.deviceId == userMe.micId)
          ?.label || getAudioDevices.value[0].label
      );
    });

    const getCameraLabel = computed(() => {
      return (
        getVideoDevices.value.find(
          (device) => device.deviceId == userMe.cameraId
        )?.label || getVideoDevices.value[0].label
      );
    });

    // const getSpeakerLabel = computed(() => {
    //   return (
    //     getAudioOuputDevices.value.find(
    //       (device) => device.deviceId == userMe.speakerId
    //     )?.label || getAudioOuputDevices.value[0].label
    //   );
    // });

    const getAudioDevices = computed(() => {
      return userDevicesDetected.value.filter(
        (device) => device.kind == 'audioinput'
      );
    });

    // const getAudioOuputDevices = computed(() => {
    //   return userDevicesDetected.value.filter(
    //     (device) => device.kind == 'audiooutput'
    //   );
    // });

    const getVideoDevices = computed(() => {
      return userDevicesDetected.value.filter(
        (device) => device.kind == 'videoinput'
      );
    });

    const selectNewMicrophone = (micDevice: MediaDeviceInfo) => {
      console.log(micDevice);
      updateUserMe({ micId: micDevice.deviceId });
      switchAudioInputSource(userMe.id, micDevice.deviceId);
    };

    const selectNewCamera = (cameraDevice: MediaDeviceInfo) => {
      console.log(cameraDevice);
      updateUserMe({ cameraId: cameraDevice.deviceId });
      switchVideoCameraCapture(userMe.id, cameraDevice.deviceId);
    };

    const selectNewSpeaker = (speakerDevices: MediaDeviceInfo) => {
      console.log(speakerDevices);
      updateUserMe({ speakerId: speakerDevices.deviceId });
      switchAudioInputSource(userMe.id, speakerDevices.deviceId);
    };

    return {
      audioDevices,
      selectNewMicrophone,
      selectNewCamera,
      videoDevices,
      selectNewSpeaker,
      userDevicesDetected,
      getAudioDevices,
      getVideoDevices,
      getMicLabel,
      getCameraLabel,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deviceConfigurationModal.scss';
</style>
