import type {
  LogWriter,
} from '../types';

const createBlockingWriter = (stream: NodeJS.WritableStream): LogWriter => {
  return {
    write: (message: string) => {
      stream.write(message + '\n');
    },
  };
};

export const createNodeWriter = (): LogWriter => {
  // eslint-disable-next-line node/no-process-env
  const targetStream = (process.env.ROARR_STREAM ?? 'STDOUT').toUpperCase();

  const stream = targetStream.toUpperCase() === 'STDOUT' ? process.stdout : process.stderr;

  return createBlockingWriter(stream);
};
