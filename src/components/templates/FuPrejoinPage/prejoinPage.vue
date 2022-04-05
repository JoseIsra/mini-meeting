<template>
  <div :class="['m-lobby', { '--fullscreen': fullscreen }]" :style="style">
    <div class="m-lobby__cameraWrapper">
      <video
        v-show="!isCameraOff"
        ref="camera"
        style="width: 100%; heigth: 100%"
        autoplay
        muted
      />
      <img v-if="!noWatermark" class="m-lobby__watermark" :src="watermark" />
      <q-avatar
        v-show="isCameraOff"
        size="150px"
        color="orange"
        text-color="white"
        >{{ userPreviewName }}</q-avatar
      >
      <div v-if="$q.screen.width > 1000 && toggle" class="m-lobby__btnWrapper">
        <q-btn
          color="white"
          :icon="microphoneIcon"
          :disable="disableDevices"
          round
          outline
          fab
          @click="toggleMicrophone"
        />
        <q-btn
          color="white"
          :icon="cameraIcon"
          :disable="disableDevices"
          round
          outline
          fab
          @click="toggleCamera"
        />
      </div>
    </div>
    <div v-if="disableDevices && !fullscreen" class="m-lobby__error">
      <q-icon color="negative" name="fas fa-exclamation-circle" size="20px" />
      <span>{{ textError }}</span>
    </div>
    <div class="m-lobby__wrapper">
      <slot name="top" />
      <q-linear-progress
        v-if="hideActionBar"
        :value="volumeIndicator"
        :dark="dark"
        size="10px"
        class="q-mt-md"
        color="secondary"
        instant-feedback
        rounded
      />
      <q-form class="m-lobby__form" @submit.prevent="handleSubmit">
        <q-input
          v-if="withName"
          v-model="userName"
          :color="inputColor"
          :dark="dark"
          :placeholder="placeHolderName"
          class="input-name q-mb-md"
          outlined
          :rules="[(val) => !!val || '']"
          @update:model-value="handleChangeName"
          :hint="hint"
        >
          <template #before>
            <q-icon :color="iconColor" name="fas fa-user" size="14px" />
          </template>
        </q-input>
        <template v-if="hideActionBar">
          <!-- <q-select
            v-model="microphoneSelected"
            :options="getDevicesObj(audioDevices)"
            :dark="dark"
            :disable="disableDevices || !chooseDevice"
            borderless
            @input="changeMicrophone"
          >
            <template #before>
              <q-icon :color="iconColor" name="fas fa-microphone" size="14px" />
            </template>
          </q-select>
          <q-select
            v-model="cameraSelected"
            :options="getDevicesObj(videoDevices)"
            :dark="dark"
            :disable="disableDevices || !chooseDevice"
            borderless
            @input="changeCamera"
          >
            <template #before>
              <q-icon :color="iconColor" name="fas fa-video" size="14px" />
            </template>
          </q-select> -->
        </template>
        <template v-else>
          <div class="q-mx-auto q-mt-sm">
            <div class="m-lobby__form__actions">
              <div class="m-lobby__form__btnWrapper">
                <q-btn
                  :text-color="iconColor"
                  :icon="microphoneIcon"
                  :disable="disableDevices || !toggle"
                  color="transparent"
                  size="12px"
                  round
                  unelevated
                  @click="toggleMicrophone"
                />
                <q-badge v-if="chooseDevice" color="grey-7" floating>
                  <q-icon color="grey-4" name="fas fa-chevron-up" size="11px">
                    <q-menu :dark="dark">
                      <q-list style="min-width: 100px">
                        <q-item
                          v-for="(device, index) in getDevicesObj(audioDevices)"
                          :key="index + device.deviceId"
                          v-close-popup
                          clickable
                          @click="microphoneSelected = device"
                        >
                          <q-item-section>{{ device.label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-badge>
              </div>
              <div class="m-lobby__form__btnWrapper">
                <q-btn
                  :text-color="iconColor"
                  :icon="cameraIcon"
                  :disable="disableDevices || !toggle"
                  color="transparent"
                  size="12px"
                  round
                  unelevated
                  @click="toggleCamera"
                />
                <q-badge v-if="chooseDevice" color="grey-7" floating>
                  <q-icon color="grey-4" name="fas fa-chevron-up" size="11px">
                    <q-menu :dark="dark">
                      <q-list style="min-width: 100px">
                        <q-item
                          v-for="(device, index) in getDevicesObj(videoDevices)"
                          :key="index + device.deviceId"
                          v-close-popup
                          clickable
                          @click="cameraSelected = device"
                        >
                          <q-item-section>{{ device.label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-icon>
                </q-badge>
              </div>
            </div>
          </div>
        </template>
        <div v-if="infoText" class="m-lobby__info">
          <q-icon color="info" name="fas fa-exclamation-circle" size="20px" />
          <span>{{ infoText }}</span>
        </div>
        <slot name="bottom" :loading="loading" />
      </q-form>
      <div v-if="disableDevices && fullscreen" class="m-lobby__error">
        <q-icon color="negative" name="fas fa-exclamation-circle" size="20px" />
        <span>{{ textError }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue';
import AudioStreamMeter from 'audio-stream-meter';
import { useQuasar } from 'quasar';
import { regexp } from '@/types';

interface IAudioStreamMeterResult {
  volume: number;
  close(): void;
}

interface IAudioStreamMeter {
  audioStreamProcessor: (
    audioctx: AudioContext,
    func: unknown
  ) => IAudioStreamMeterResult;
}

export default defineComponent({
  name: 'FuTPrejoinPage',
  props: {
    avatarUrl: {
      type: String,
      default: '',
    },
    backgroundColor: {
      type: String,
      default: '#36393f',
    },
    cameraBackground: {
      type: String,
      default: '#040404',
    },
    dark: {
      type: Boolean,
      default: true,
    },
    chooseDevice: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: true,
    },
    infoText: {
      type: String,
      default:
        'Podrás cambiar de cámara o micrófono después de entrar. Siempre entrarás con cámara y micrófono apagados por defecto',
    },
    placeHolderName: {
      type: String,
      default: 'Nombre Apellido',
    },
    name: {
      type: String,
      default: '',
    },
    noWatermark: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
    watermark: {
      type: String,
      default:
        'https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/logo/logo_cooperate.svg',
    },
    width: {
      type: String,
      default: '100%',
    },
    withName: {
      type: Boolean,
      default: false,
    },
    toggle: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const microphoneSelected = ref<MediaDeviceInfo>({
      label: 'Default',
    } as MediaDeviceInfo);
    const cameraSelected = ref<MediaDeviceInfo>({
      label: 'Default',
    } as MediaDeviceInfo);
    const volumeIndicator = ref(0);
    const videoDevices = ref<MediaDeviceInfo[]>([]);
    const audioDevices = ref<MediaDeviceInfo[]>([]);
    const isMicrophoneOff = ref(false);
    const isCameraOff = ref(false);
    const disableDevices = ref(false);
    const audioStreamMeter = ref<IAudioStreamMeterResult | null>(null);
    const audioStream = ref<MediaStream | null>(null);
    const loading = ref(true);
    const camera = ref({} as HTMLVideoElement);
    const userName = ref(props.name);
    const textError = ref('');
    const hint = ref('');

    const microphoneIcon = computed(() => {
      return isMicrophoneOff.value
        ? 'fas fa-microphone-slash'
        : 'fas fa-microphone';
    });

    const cameraIcon = computed(() => {
      return isCameraOff.value ? 'fas fa-video-slash' : 'fas fa-video';
    });

    const style = computed(() => {
      return {
        '--bg-color': props.backgroundColor,
        '--camera-bg': props.cameraBackground,
        width: props.width,
      };
    });

    const isTalking = computed(() => {
      return !isMicrophoneOff.value && volumeIndicator.value * 100 > 1;
    });

    const iconColor = computed(() => {
      return props.dark ? 'grey-1' : 'grey-10';
    });
    const inputColor = computed(() => {
      return props.dark ? 'grey-1' : 'secondary';
    });
    const hideActionBar = computed(() => {
      return !props.fullscreen || $q.screen.width > 1000;
    });

    watch(
      () => cameraSelected.value,
      () => {
        emit('camera', cameraSelected.value);
      }
    );

    watch(
      () => microphoneSelected.value,
      () => {
        emit('microphone', microphoneSelected.value);
      }
    );

    onMounted(() => {
      initStream();
      getDevices();
    });

    onBeforeUnmount(() => {
      stopCamera();
      stopMicrophone();
    });

    const userPreviewName = computed(() => {
      return (userName.value && userName.value[0].toUpperCase()) || '';
    });

    const handleError = (error: Error) => {
      isMicrophoneOff.value = true;
      isCameraOff.value = true;
      disableDevices.value = true;
      setErrorMessage(error);
    };

    const setErrorMessage = (error: Error) => {
      const { message } = error;
      if (message == 'Permission denied') {
        textError.value = 'Tiene periférico(s) bloqueado(s)';
      }
    };

    const initStream = () => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          camera.value.srcObject = stream;
          initVolumeMeter(stream);
        })
        .catch(handleError)
        .finally(() => {
          loading.value = false;
        });
    };

    const initVolumeMeter = (stream: MediaStream) => {
      audioStream.value = stream;

      const audioContext = new AudioContext();

      const mediaStream = audioContext.createMediaStreamSource(stream);

      const meter = (
        AudioStreamMeter as IAudioStreamMeter
      ).audioStreamProcessor(audioContext, () => {
        volumeIndicator.value = meter.volume;
      });

      stream.getTracks().forEach((track) => {
        if (track.readyState === 'live' && track.kind === 'audio') {
          track.enabled = !isMicrophoneOff.value;
        }
      });

      mediaStream.connect(meter as unknown as AudioNode);
      audioStreamMeter.value = meter;
    };

    const getDevices = () => {
      // await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      void navigator.mediaDevices.enumerateDevices().then((response) => {
        videoDevices.value = response.filter(
          (device) => device.kind === 'videoinput'
        );
        [cameraSelected.value] = videoDevices.value;

        audioDevices.value = response.filter(
          (device) => device.kind === 'audioinput'
        );
        [microphoneSelected.value] = audioDevices.value;
      });
    };

    const changeMicrophone = async () => {
      audioStreamMeter.value?.close();
      stopMicrophone();
      await navigator.mediaDevices
        .getUserMedia({
          audio: { deviceId: microphoneSelected.value.deviceId },
        })
        .then((stream) => {
          initVolumeMeter(stream);
        });
    };

    const changeCamera = async () => {
      await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: cameraSelected.value.deviceId },
        })
        .then((stream) => {
          camera.value.srcObject = stream;
        });
    };

    const toggleMicrophone = () => {
      isMicrophoneOff.value = !isMicrophoneOff.value;
      emit('toggle-mic', !isMicrophoneOff.value);

      const stream = audioStream.value;
      stream?.getTracks().forEach((track) => {
        if (track.readyState === 'live' && track.kind === 'audio') {
          track.enabled = !isMicrophoneOff.value;
        }
      });
    };

    const stopCamera = () => {
      const streamCamera = camera.value.srcObject as MediaStream;
      streamCamera?.getTracks().forEach((track) => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    };

    const stopMicrophone = () => {
      const stream = audioStream.value as MediaStream;
      stream.getTracks().forEach((track) => {
        if (track.readyState === 'live' && track.kind === 'audio') {
          track.stop();
        }
      });
    };

    const toggleCamera = () => {
      isCameraOff.value = !isCameraOff.value;
      const videoTrack =
        audioStream.value?.getVideoTracks()[0] as MediaStreamTrack;
      videoTrack.enabled = !isCameraOff.value;
      videoTrack.stop();
      emit('toggle-cam', !isCameraOff.value);
    };

    const getDevicesObj = (devices: MediaDeviceInfo[]) => {
      if (devices.length)
        return devices.map((d) => ({ label: d.label, deviceId: d.deviceId }));
    };

    const handleChangeName = (newName: string) => {
      emit('update:value', newName);
    };

    const handleSubmit = () => {
      if (regexp.test(userName.value)) {
        emit('submit', userName.value);
        console.debug('into cooperate');
      } else {
        hint.value = 'Nombre requerido';
        console.debug('no into cooperate bc nam');
      }
    };

    return {
      microphoneIcon,
      cameraIcon,
      isTalking,
      iconColor,
      inputColor,
      hideActionBar,
      style,
      camera,
      getDevices,
      changeCamera,
      changeMicrophone,
      toggleMicrophone,
      stopCamera,
      stopMicrophone,
      toggleCamera,
      getDevicesObj,
      handleChangeName,
      handleSubmit,
      disableDevices,
      volumeIndicator,
      isCameraOff,
      loading,
      props,
      userName,
      userPreviewName,
      textError,
      hint,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './prejoinPage.scss';
</style>
