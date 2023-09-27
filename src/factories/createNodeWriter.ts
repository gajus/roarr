import { type LogWriter } from '../types';

// This is causing memory leak warning.
process.stdout.on('error', () => {});

export const createNodeWriter = (): LogWriter => {
  return () => {};
};
