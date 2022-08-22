import {
  boolean,
} from 'boolean';
import fastJson from 'fast-json-stringify';
import safeStringify from 'fast-safe-stringify';
import createGlobalThis from 'globalthis';
import {
  logLevels,
} from './constants';
import {
  createLogger,
} from './factories/createLogger';
import {
  createMockLogger,
} from './factories/createMockLogger';
import {
  createRoarrInitialGlobalState,
} from './factories/createRoarrInitialGlobalState';
import {
  getLogLevelName,
} from './getLogLevelName';
import type {
  MessageSerializer,
  RoarrGlobalState,
} from './types';

const fastStringify = fastJson({
  properties: {
    message: {
      type: 'string',
    },
    sequence: {
      type: 'string',
    },
    time: {
      type: 'integer',
    },
    version: {
      type: 'string',
    },
  },
  type: 'object',
});

const globalThis = createGlobalThis();

const ROARR = globalThis.ROARR = createRoarrInitialGlobalState(globalThis.ROARR as RoarrGlobalState || {});

let logFactory = createLogger;

// eslint-disable-next-line node/no-process-env
const enabled = boolean(process.env.ROARR_LOG ?? '');

if (!enabled) {
  logFactory = createMockLogger;
}

const serializeMessage: MessageSerializer = (message) => {
  return '{"context":' + safeStringify(message.context) + ',' + fastStringify(message).slice(1);
};

const Roarr = logFactory((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    ROARR.write((ROARR.serializeMessage ?? serializeMessage)(message));
  }
});

export type {
  Logger,
  LogLevelName,
  LogWriter,
  Message,
  MessageContext,
  MessageEventHandler,
  MessageSerializer,
  RoarrGlobalState,
  TransformMessageFunction,
} from './types';

export {
  getLogLevelName,
  logLevels,
  Roarr,
  ROARR,
};
