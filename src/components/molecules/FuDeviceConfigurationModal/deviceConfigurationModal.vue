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
        <div class="m-config__body__periferics__box --micro">
          <p class="m-config__body__periferics__box__label">Salidas de audio</p>
          <q-btn-dropdown color="primary" flat rounded :label="speakerLabel">
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-for="device in getDevicesObject(audioDevices)"
                :key="device.deviceId"
                @click="selectNewSpeaker(device)"
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
import { defineComponent, ref, onMounted, computed } from 'vue';
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
    const { userMe, updateUserMe } = useUserMe();
    const {
      switchAudioInputSource,
      switchVideoCameraCapture,
      turnOffLocalCamera,
    } = useInitWebRTC();
    const control = ref(false);
    const cameraLabel = ref('');
    const micLabel = ref('');
    const speakerLabel = ref('');

    onMounted(() => {
      turnOffLocalCamera(userMe.id);
      getDevices();
    });

    const getMicLabel = computed(() => {
      return audioDevices.value.find(
        (device) => device.deviceId == userMe.micId
      )?.label;
    });

    const getCameraLabel = computed(() => {
      return videoDevices.value.find(
        (device) => device.deviceId == userMe.cameraId
      )?.label;
    });

    const getSpeakerLabel = computed(() => {
      return audioDevices.value.find(
        (device) => device.deviceId == userMe.speakerId
      )?.label;
    });

    const gotDevices = (deviceInfo: MediaDeviceInfo[]) => {
      videoDevices.value = deviceInfo.filter(
        (device) => device.kind == 'videoinput'
      );
      if (videoDevices.value.length > 0) {
        cameraLabel.value = getCameraLabel.value || videoDevices.value[0].label;
      }
      audioDevices.value = deviceInfo.filter(
        (device) => device.kind == 'audioinput'
      );

      if (audioDevices.value.length > 0) {
        micLabel.value = getMicLabel.value || audioDevices.value[0].label;
        speakerLabel.value =
          getSpeakerLabel.value || audioDevices.value[0].label;
      }
      control.value = true;
    };

    const getDevices = () => {
      // await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      navigator.mediaDevices
        .enumerateDevices()
        .then(gotDevices)
        .catch((err) => console.log(err));
    };

    const selectNewMicrophone = (micDevice: MediaDeviceInfo) => {
      setTimeout(() => {
        turnOffLocalCamera?.(userMe.id);
      }, 2000);
      console.log(micDevice);
      micLabel.value = micDevice.label;
      updateUserMe({ micId: micDevice.deviceId });
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
      updateUserMe({ cameraId: cameraDevice.deviceId });
      switchVideoCameraCapture(userMe.id, cameraDevice.deviceId);
    };

    const selectNewSpeaker = (speakerDevices: MediaDeviceInfo) => {
      setTimeout(() => {
        turnOffLocalCamera?.(userMe.id);
      }, 2000);
      console.log(speakerDevices);
      speakerLabel.value = speakerDevices.label;
      updateUserMe({ speakerId: speakerDevices.deviceId });
      switchAudioInputSource(userMe.id, speakerDevices.deviceId);
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
      selectNewSpeaker,
      speakerLabel,
    };
  },
});
</script>

<style scoped lang="scss">
@import './deviceConfigurationModal.scss';
</style>
