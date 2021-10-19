<template>
  <q-card class="m-config">
    <q-card-section tag="header" class="m-config__head">
      <h6 class="m-config__head__text">Configuración de dispositivos</h6>
    </q-card-section>
    <q-card-section class="m-config__body" tag="div">
      <div class="m-config__body__periferics">
        <p class="m-config__body__periferics__title">Mis dispositivos</p>
        <div class="m-config__body__periferics__box">
          <!-- <q-select
            v-model="microphoneSelected"
            borderless
            dense
            class="m-config__body__periferics__box__list"
            label-color="black"
            bg-color="white"
            style="width: 300px"
            :options="getDevicesObject(audioDevices)"
            @input="selectNewMicrophone(microphoneSelected)"
          >
            <template #before>
              <q-icon color="white" name="fas fa-microphone" size="14px" />
            </template>
          </q-select> -->
          <!-- 
          <q-select
            v-model="cameraSelected.label"
            borderless
            dense
            label-color="black"
            bg-color="white"
            style="width: 300px"
            class="m-config__body__periferics__box__list"
            :options="getDevicesObject(videoDevices)"
            @input="selectNewCamera"
          >
            <template #before>
              <q-icon color="white" name="fas fa-video" size="14px" />
            </template>
          </q-select> -->

          <q-btn-dropdown
            color="primary"
            :label="
              microphoneSelected.label ? microphoneSelected.label : 'goes'
            "
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="chazam(device)"
                v-for="(device, index) in getDevicesObject(audioDevices)"
                :key="index"
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
import { defineComponent, ref, reactive, onMounted } from 'vue';

export default defineComponent({
  setup() {
    let microphoneSelected = reactive<MediaDeviceInfo>({
      label: 'Default',
    } as MediaDeviceInfo);

    let cameraSelected = reactive<MediaDeviceInfo>({
      label: 'Default',
    } as MediaDeviceInfo);

    const audioDevices = ref<MediaDeviceInfo[]>([]);
    const videoDevices = ref<MediaDeviceInfo[]>([]);

    onMounted(async () => {
      await getDevices();
    });

    const getDevices = async () => {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      navigator.mediaDevices
        .enumerateDevices()
        .then((res) => {
          videoDevices.value = res.filter(
            (device) => device.kind == 'videoinput'
          );
          cameraSelected = videoDevices.value[0];

          audioDevices.value = res.filter(
            (device) => device.kind == 'audioinput'
          );
          microphoneSelected = audioDevices.value[0];
        })
        .catch((err) => console.log(err));
    };

    const selectNewMicrophone = (micDevice: MediaDeviceInfo) => {
      console.log('mic en selectnew micro', micDevice);
      navigator.mediaDevices
        .getUserMedia({ audio: { deviceId: micDevice.deviceId } })
        .then(() => {
          console.log('aea');
          // Object.assign(microphoneSelected, micDevice);
        })
        .catch((error) => console.log(error));
    };

    const getDevicesObject = (devices: MediaDeviceInfo[]) => {
      return devices.map((device) => ({
        label: device.label,
        deviceId: device.deviceId,
      }));
    };

    const selectNewCamera = (cameraDevice: MediaDeviceInfo) => {
      console.log(cameraDevice, 'as');
      navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: cameraDevice.deviceId },
        })
        .then(() => {
          console.log('stream bro');
          Object.assign(cameraSelected, cameraDevice);
        })
        .catch((err) => console.log(err));
    };

    const chazam = (device: MediaDeviceInfo) => {
      microphoneSelected = device;
    };
    return {
      microphoneSelected,
      getDevicesObject,
      audioDevices,
      selectNewMicrophone,
      cameraSelected,
      selectNewCamera,
      videoDevices,
      chazam,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deviceConfigurationModal.scss';
</style>
