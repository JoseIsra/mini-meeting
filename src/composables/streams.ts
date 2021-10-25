import _ from 'lodash';
import { reactive } from 'vue';

interface Stream {
  id: string;
  isBeingPlayed: boolean;
}

const streams = reactive<Partial<Stream>[]>([] as Partial<Stream>[]);

export function useStreams() {
  const addStream = (stream: Partial<Stream>) => {
    streams.push(stream);
  };

  const updateStreamById = (id: string, update: Partial<Stream>) => {
    const stream = streams.find((s) => s.id === id);
    Object.assign(stream, { stream, ...update });
  };

  const findStreamById = (id: string) =>
    streams.find((stream) => stream.id === id);

  const removeStreamById = (id: string) => {
    console.log('removing', id, '◀️');
    const newStreams = _.cloneDeep(streams);
    const filteredResult = newStreams.filter((stream) => stream.id !== id);
    Object.assign(streams, filteredResult);
    console.log(streams);
  };

  return {
    addStream,
    updateStreamById,
    streams,
    findStreamById,
    removeStreamById,
  };
}
