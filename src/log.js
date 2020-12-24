// @flow

import {
  boolean,
} from 'boolean';
import environmentIsNode from 'detect-node';
import fastJson from 'fast-json-stringify';
import createGlobalThis from 'globalthis';
import {
  createLogger,
  createMockLogger,
  createRoarrInititialGlobalState,
} from './factories';

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

const ROARR = globalThis.ROARR = createRoarrInititialGlobalState(globalThis.ROARR || {});

let logFactory = createLogger;

if (environmentIsNode) {
  // eslint-disable-next-line node/no-process-env
  const enabled = boolean(process.env.ROARR_LOG || '');

  if (!enabled) {
    logFactory = createMockLogger;
  }
}

export type {
  LoggerType,
  MessageType,
  TranslateMessageFunctionType,
} from './types';

export {
  ROARR,
};

export default logFactory((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = stringify(message);

    ROARR.write(body);
  }
});
