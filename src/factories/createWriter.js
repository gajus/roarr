// @flow

import type {
  WriterType
} from '../types';

type WriteConfigurationType = {|
  +bufferSize: number,
  +stream: 'STDOUT' | 'STDERR'
|};

const createBlockingWriter = (stream: stream$Writable): WriterType => {
  return {
    flush: () => {},
    write: (message: string) => {
      stream.write(message + '\n');
    }
  };
};

const createBufferedWriter = (stream: stream$Writable, bufferSize: number): WriterType => {
  const flush = () => {
    if (!global.ROARR.buffer) {
      return;
    }

    const buffer = global.ROARR.buffer;

    global.ROARR.buffer = '';

    stream.write(buffer);
  };

  return {
    flush,
    write: (message: string) => {
      global.ROARR.buffer += message + '\n';

      if (global.ROARR.buffer.length > bufferSize) {
        flush();
      }

      // @todo Write messages when the event loop is not busy.
    }
  };
};

// @todo Add browser support.
export default (configuration: WriteConfigurationType): WriterType => {
  const stream = configuration.stream.toUpperCase() === 'STDOUT' ? process.stdout : process.stderr;

  if (configuration.bufferSize) {
    return createBufferedWriter(stream, configuration.bufferSize);
  } else {
    return createBlockingWriter(stream);
  }
};
