<template>
  <q-card class="m-config">
    <q-card-section tag="header" class="m-config__head">
      <h6 class="m-config__head__text">Configuración de dispositivos</h6>
    </q-card-section>
    <q-spinner-cube v-show="!control" color="blue" size="40px" />
    <q-card-section class="m-config__body" tag="div" v-show="control">
      <div class="m-config__body__periferics">
        <p class="m-config__body__periferics__title">Mis dispositivos</p>
        <div class="m-config__body__periferics__box --micro">
          <p class="m-config__body__periferics__box__label">Microfonos</p>
          <q-btn-dropdown color="primary" flat rounded :label="micLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getDevicesObject(audioDevices)"
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
        <div class="m-config__body__periferics__box --camera">
          <p class="m-config__body__periferics__box__label">Cámaras</p>
          <q-btn-dropdown color="primary" flat rounded :label="cameraLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getDevicesObject(videoDevices)"
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
import { defineComponent, ref, onMounted } from 'vue';
import { useInitWebRTC } from '@/composables/antMedia';
import { useUserMe } from '@/composables/userMe';

type MediaDeviceKind = 'audioinput' | 'audiooutput' | 'videoinput';
interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: MediaDeviceKind;
  label: string;
}

export default defineComponent({
  setup() {
    const audioDevices = ref<MediaDeviceInfo[]>([]);
    const videoDevices = ref<MediaDeviceInfo[]>([]);
    const { userMe } = useUserMe();
    const {
      switchAudioInputSource,
      switchVideoCameraCapture,
      turnOffLocalCamera,
    } = useInitWebRTC();
    const control = ref(false);
    const cameraLabel = ref('');
    const micLabel = ref('');

    onMounted(() => {
      turnOffLocalCamera(userMe.id);
      getDevices();
    });

    const getDevices = () => {
      // await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      navigator.mediaDevices
        .enumerateDevices()
        .then((res) => {
          videoDevices.value = res.filter(
            (device) => device.kind == 'videoinput'
          );
          if (videoDevices.value.length > 0) {
            cameraLabel.value = videoDevices.value[0].label;
          }
          audioDevices.value = res.filter(
            (device) => device.kind == 'audioinput'
          );

          if (audioDevices.value.length > 0) {
            micLabel.value = audioDevices.value[0].label;
          }
          control.value = true;
        })
        .catch((err) => console.log(err));
    };

    const selectNewMicrophone = (micDevice: MediaDeviceInfo) => {
      setTimeout(() => {
        turnOffLocalCamera?.(userMe.id);
      }, 2000);
      console.log(micDevice);
      micLabel.value = micDevice.label;
      switchAudioInputSource(userMe.id, micDevice.deviceId);
    };

    const getDevicesObject = (devices: MediaDeviceInfo[]) => {
      return devices.map((device) => ({
        label: device.label,
        deviceId: device.deviceId,
        groupId: device.groupId,
        kind: device.kind,
      }));
    };

    const selectNewCamera = (cameraDevice: MediaDeviceInfo) => {
      setTimeout(() => {
        turnOffLocalCamera?.(userMe.id);
      }, 2000);
      console.log(cameraDevice);
      cameraLabel.value = cameraDevice.label;
      switchVideoCameraCapture(userMe.id, cameraDevice.deviceId);
    };

    return {
      getDevicesObject,
      audioDevices,
      selectNewMicrophone,
      selectNewCamera,
      videoDevices,
      control,
      cameraLabel,
      micLabel,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deviceConfigurationModal.scss';
</style>
