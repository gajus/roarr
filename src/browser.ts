import createGlobalThis from 'globalthis';
import {
  logLevels,
} from './constants';
import {
  createLogger,
} from './factories/createLogger';
import {
  createRoarrInitialGlobalStateBrowser,
} from './factories/createRoarrInitialGlobalStateBrowser';
import {
  getLogLevelName,
} from './getLogLevelName';
import type {
  RoarrGlobalState,
  MessageSerializer,
} from './types';

const globalThis = createGlobalThis();

const ROARR = globalThis.ROARR = createRoarrInitialGlobalStateBrowser(globalThis.ROARR as RoarrGlobalState || {});

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
  MessageSerializer,
  Logger,
  LogLevelName,
  Message,
  MessageEventHandler,
  RoarrGlobalState,
  TransformMessageFunction,
} from './types';

export {
  getLogLevelName,
  logLevels,
  Roarr,
  ROARR,
};
