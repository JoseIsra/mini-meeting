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
          <q-btn-dropdown
            color="primary"
            flat
            rounded
            :label="microphoneSelected.label"
          >
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
          <q-btn-dropdown
            color="primary"
            flat
            rounded
            :label="cameraSelected.label"
          >
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
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useInitWebRTC, useUserMe } from '@/composables';

type MediaDeviceKind = 'audioinput' | 'audiooutput' | 'videoinput';
interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: MediaDeviceKind;
  label: string;
}

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
    const { updateUserMe, userMe } = useUserMe();
    const {
      switchAudioInputSource,
      switchVideoCameraCapture,
      turnOffLocalCamera,
      muteLocalMic,
    } = useInitWebRTC();

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

          audioDevices.value = res.filter(
            (device) => device.kind == 'audioinput'
          );
        })
        .catch((err) => console.log(err));
    };

    const selectNewMicrophone = (micDevice: MediaDeviceInfo) => {
      muteLocalMic();
      updateUserMe({ micId: micDevice.deviceId });
      Object.assign(microphoneSelected, micDevice);
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
      turnOffLocalCamera(userMe.id);
      updateUserMe({ cameraId: cameraDevice.deviceId });
      Object.assign(cameraSelected, cameraDevice);
      switchVideoCameraCapture(userMe.id, cameraDevice.deviceId);
    };

    return {
      microphoneSelected,
      getDevicesObject,
      audioDevices,
      selectNewMicrophone,
      cameraSelected,
      selectNewCamera,
      videoDevices,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deviceConfigurationModal.scss';
</style>
