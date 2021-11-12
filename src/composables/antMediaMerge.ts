import { ref } from 'vue';
import { WebRTCAdaptor } from '@/utils/webrtc/webrtc_adaptor';
import { useUserMe } from '@/composables';
import { objWebRTC } from '@/types/index';
import { User } from '@/types/user';
import { StreamMerger } from '@/utils/webrtc/stream_merger';
// import { useHandleParticipants } from '@/composables/participants';

// const { participants } = useHandleParticipants();

export function useInitMerge() {
  const { userMe } = useUserMe();

  const existMyOwnStream = ref<boolean>(false);

  const webRTCRecordingInstance = ref<WebRTCAdaptor | null>(
    {} as WebRTCAdaptor
  );
  const mergerInstance = ref<StreamMerger>({} as StreamMerger);

  const xindex = ref(0);
  const yindex = ref(0);
  const publishRecording = (
    streamId: string,
    token?: string,
    subscriberId?: string,
    subscriberCode?: string,
    streamName?: string
  ) => {
    webRTCRecordingInstance.value?.publish?.(
      streamId,
      token,
      subscriberId,
      subscriberCode,
      streamName
    );
  };

  const joinRoomRecording = (roomId: string, streamId: string) => {
    webRTCRecordingInstance.value?.joinRoom?.(roomId, streamId, 'legacy');
  };

  const refreshMerge = (
    prevParticipants: Partial<User>[],
    actualParticipants: Partial<User>[]
  ) => {
    const actualIds: string[] = [];
    const prevIds: string[] = [];
    for (let i = 0; i < prevParticipants.length; i++) {
      prevIds.push(prevParticipants[i].id as string);
    }
    for (let i = 0; i < actualParticipants.length; i++) {
      actualIds.push(actualParticipants[i].id as string);
    }
    for (let i = 0; i < prevIds.length; i++) {
      const isInTheRoom = actualIds.includes(prevIds[i]);
      if (!isInTheRoom) {
        mergerInstance.value.removeStream(prevIds[i]);
      }
      //console.log(isInTheRoom, prevIds[i]);
    }
    for (let i = 0; i < actualIds.length; i++) {
      const isNewInTheRoom = !prevIds.includes(actualIds[i]);
      const newStream = actualParticipants.filter(
        (participant) => participant.id === actualIds[i]
      )[0].stream;
      if (isNewInTheRoom) {
        mergerInstance.value.addStream(newStream, {
          Xindex: xindex,
          Yindex: yindex,
          streamId: actualIds[i],
        });
        if (xindex.value == 3) {
          yindex.value++;
          xindex.value = 0;
        }
        xindex.value++;
      }
    }
  };

  const mergeStreams = (streamId: string, streamName: string) => {
    const delayInMilliseconds = 3500;

    setTimeout(() => {
      mergerInstance.value.start();

      /* participants.value.forEach((participant) => {
        mergerInstance.value.addStream(participant.stream, {
          Xindex: xindex,
          Yindex: yindex,
          streamId: participant.id,
        });
        if (xindex.value == 3) {
          yindex.value++;
          xindex.value = 0;
        }
        xindex.value++;
      }); */

      const result = mergerInstance.value.getResult() as MediaStream;

      webRTCRecordingInstance.value?.gotStream(result);

      publishRecording(streamId, undefined, undefined, undefined, streamName);
    }, delayInMilliseconds);
  };

  const stopRecordingStream = (streamId: string) => {
    webRTCRecordingInstance.value?.stop(streamId);
    mergerInstance.value.stop();
    webRTCRecordingInstance.value = null;
    existMyOwnStream.value = false;
    mergerInstance.value = {} as StreamMerger;
  };

  const recordingStream = (
    streamId: string,
    streamName: string,
    roomId: string
  ) =>
    new Promise((resolve, reject) => {
      const websocketURL = `wss://${process.env.ANTMEDIA_SERVER}/${process.env.ANTMEDIA_APP}/websocket`;

      mergerInstance.value = new StreamMerger(1280, 720, true, '16:9');

      const mediaConstraints = {
        video: true,
        audio: true,
      };

      const pc_config = {
        iceServers: [
          {
            urls: 'stun:stun1.l.google.com:19302',
          },
        ],
      };

      const sdpConstraints = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false,
      };

      webRTCRecordingInstance.value = new WebRTCAdaptor({
        websocket_url: websocketURL,
        mediaConstraints: mediaConstraints,
        peerconnection_config: pc_config,
        sdp_constraints: sdpConstraints,
        isPlayMode: true,
        debug: false,
        dataChannelEnabled: true,
        callback: (info: string, obj: objWebRTC) => {
          if (info == 'initialized') {
            joinRoomRecording(roomId, streamId);
          } else if (info == 'joinedTheRoom') {
            console.log(obj);
            mergeStreams(streamId, streamName);

            window.addEventListener('unload', () => {
              webRTCRecordingInstance.value?.leaveFromRoom?.(roomId);
            });

            obj.streams.forEach(function (item) {
              console.log(item);

              if (userMe.id === item)
                webRTCRecordingInstance.value?.play?.(
                  item,
                  '',
                  roomId,
                  undefined,
                  undefined,
                  undefined
                );
            });
          } else if (info == 'newStreamAvailable') {
            console.log('new stream available 🅿️🅿️🅿️');

            if (!existMyOwnStream.value && userMe.id === obj.streamId) {
              obj.stream;
              mergerInstance.value.addStream(obj.stream, {
                Xindex: xindex,
                Yindex: yindex,
                streamId: obj.streamId,
              });
              if (xindex.value == 3) {
                yindex.value++;
                xindex.value = 0;
              }
              xindex.value++;

              existMyOwnStream.value = true;
            }

            console.log(obj);
          } else if (info == 'publish_started') {
            console.log(obj);
            resolve('SUCCESS');
          }
        },
        callbackError: (error: string, message: string) => {
          console.log(error, message);
          const errorMessage = message;
          reject(errorMessage);
        },
      });
    });

  return {
    stopRecordingStream,
    recordingStream,
    refreshMerge,
  };
}
