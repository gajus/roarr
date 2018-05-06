// @flow

type WriteConfigurationType = {|
  +bufferSize: number,
  +stream: 'STDOUT' | 'STDERR'
|};

// @todo Add browser support.
export default (configuration: WriteConfigurationType) => {
  const stream = configuration.stream.toUpperCase() === 'STDOUT' ? process.stdout : process.stderr;
  const write = stream.write.bind(stream);

  if (!configuration.bufferSize) {
    return {
      flush: () => {},
      write: (message: string) => {
        write(message + '\n');
      }
    };
  }

  const flush = () => {
    if (!global.ROARR.buffer) {
      return;
    }

    const buffer = global.ROARR.buffer;

    global.ROARR.buffer = '';

    write(buffer);
  };

  return {
    flush,
    write: (message: string) => {
      global.ROARR.buffer += message + '\n';

      if (global.ROARR.buffer.length > configuration.bufferSize) {
        flush();
      }

      // @todo Write messages when the event loop is not busy.
    }
  };
};
