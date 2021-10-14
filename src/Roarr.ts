import {
  boolean,
} from 'boolean';
import fastJson from 'fast-json-stringify';
import createGlobalThis from 'globalthis';
import {
  createLogger,
} from './factories/createLogger';
import {
  createMockLogger,
} from './factories/createMockLogger';
import {
  createRoarrInitialGlobalState,
} from './factories/createRoarrInitialGlobalState';
import type {
  RoarrGlobalState,
} from './types';

const stringify = fastJson({
  properties: {
    context: {
      additionalProperties: true,
      type: 'object',
    },
    message: {
      type: 'string',
    },
    sequence: {
      type: 'integer',
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

const Roarr = logFactory((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = stringify(message);

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
