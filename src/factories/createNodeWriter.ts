import { type LogWriter } from '../types';

export type NodeWriter = {
  teardown: () => void;
  write: LogWriter;
};

const createBlockingWriter = (stream: NodeJS.WritableStream): LogWriter => {
  return (message: string) => {
    stream.write(message + '\n');
  };
};

const createOnError = () => {
  return (error) => {
    if (error.code === 'EPIPE') {
      return;
    }

    throw error;
  };
};

export const createNodeWriter = (): NodeWriter => {
  // eslint-disable-next-line node/no-process-env
  const targetStream = (process.env.ROARR_STREAM ?? 'STDOUT').toUpperCase();

  const stream =
    targetStream.toUpperCase() === 'STDOUT' ? process.stdout : process.stderr;

  const onError = createOnError();

  stream.on('error', onError);

  return {
    teardown: () => {
      stream.removeListener('error', onError);
    },
    write: createBlockingWriter(stream),
  };
};
