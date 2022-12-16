import createGlobalThis from 'globalthis';
import {
  createLogger,
} from './factories/createLogger';
import {
  createRoarrInitialGlobalStateBrowser,
} from './factories/createRoarrInitialGlobalStateBrowser';
import {
  type RoarrGlobalState,
  type MessageSerializer,
} from './types';

const globalThis = createGlobalThis();

const ROARR = createRoarrInitialGlobalStateBrowser(globalThis.ROARR as RoarrGlobalState || {});

globalThis.ROARR = ROARR;

const serializeMessage: MessageSerializer = (message) => {
  return JSON.stringify(message);
};

const Roarr = createLogger((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    ROARR.write((ROARR.serializeMessage ?? serializeMessage)(message));
  }
});

export type {
  Logger,
  LogLevelName,
  Message,
  MessageContext,
  MessageEventHandler,
  MessageSerializer,
  RoarrGlobalState,
  TransformMessageFunction,
} from './types';

export {

  Roarr,
  ROARR,
};

export {
  logLevels,
} from './constants';
export {
  getLogLevelName,
} from './getLogLevelName';
