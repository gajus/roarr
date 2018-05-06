// @flow

type WriteConfigurationType = {|
  +bufferSize: number,
  +stream: 'STDOUT' | 'STDERR'
|};

// @todo Add browser support.
export default (configuration: WriteConfigurationType) => {
  const write = configuration.stream === 'STDOUT' ? process.stdout.write.bind(process.stdout) : process.stderr.write.bind(process.stdout);

  if (configuration.bufferSize) {
    const flush = () => {
      const buffer = global.ROARR.buffer;

      global.ROARR.buffer = '';

      write(buffer);
    };

    process.on('exit', () => {
      if (!global.ROARR || !global.ROARR.buffer) {
        return;
      }

      flush();
    });

    return (message: string) => {
      global.ROARR.buffer += message + '\n';

      if (global.ROARR.buffer.length > configuration.bufferSize) {
        flush();
      }

      // @todo Write messages when the event loop is not busy.
    };
  } else {
    return (message: string) => {
      write(message + '\n');
    };
  }
};
