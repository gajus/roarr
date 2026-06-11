import { type LogWriter } from '../types';

const createBlockingWriter = (stream: NodeJS.WritableStream): LogWriter => {
  return (message: string) => {
    stream.write(message + '\n', (error?: Error | null) => {
      if (!error) {
        return;
      }

      if ('code' in error && error.code === 'EPIPE') {
        return;
      }

      throw error;
    });
  };
};

export const createNodeWriter = (): LogWriter => {
  // eslint-disable-next-line node/no-process-env
  const targetStream = (process.env.ROARR_STREAM ?? 'STDOUT').toUpperCase();

  const stream = targetStream === 'STDOUT' ? process.stdout : process.stderr;

  return createBlockingWriter(stream);
};
