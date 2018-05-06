// @flow

import type {
  RoarrGlobalStateType
} from '../types';

type WriteConfigurationType = {|
  +bufferSize: number,
  +stream: 'STDOUT' | 'STDERR'
|};

// @todo Add browser support.
export default (currentState: RoarrGlobalStateType, configuration: WriteConfigurationType) => {
  const stream = configuration.stream.toUpperCase() === 'STDOUT' ? process.stdout : process.stderr;
  const write = stream.write.bind(stream);

  if (!configuration.bufferSize) {
    return (message: string) => {
      write(message + '\n');
    };
  }

  const flush = () => {
    if (!currentState.buffer) {
      return;
    }

    const buffer = currentState.buffer;

    currentState.buffer = '';

    write(buffer);
  };

  // `createWrite` method is only called when RoarrGlobalStateType is being assigned
  // a new `write` instance. Therefore, it is safe to override `flush` method.
  if (currentState.flush) {
    currentState.flush = flush;
  }

  return (message: string) => {
    currentState.buffer += message + '\n';

    if (currentState.buffer.length > configuration.bufferSize) {
      flush();
    }

    // @todo Write messages when the event loop is not busy.
  };
};
