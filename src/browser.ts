import createGlobalThis from 'globalthis';
import {
  createLogger,
  createRoarrInitialGlobalState,
} from './factories';
import type {
  RoarrGlobalState,
} from './types';

const globalThis = createGlobalThis();

const ROARR = globalThis.ROARR = createRoarrInitialGlobalState(globalThis.ROARR as RoarrGlobalState || {});

const logFactory = createLogger;

const Roarr = logFactory((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = JSON.stringify(message);

    ROARR.write(body);
  }
});

export type {
  Logger,
  Message,
  TranslateMessageFunction,
  MessageEventHandler,
} from './types';

export {
  Roarr,
  ROARR,
};
