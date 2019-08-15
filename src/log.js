// @flow

import boolean from 'boolean';
import createGlobalThis from 'globalthis';
import environmentIsNode from 'detect-node';
import {
  createLogger,
  createMockLogger,
  createRoarrInititialGlobalState,
} from './factories';

const globalThis = createGlobalThis();

globalThis.ROARR = createRoarrInititialGlobalState(globalThis.ROARR || {});

let logFactory = createLogger;

if (environmentIsNode) {
  // eslint-disable-next-line no-process-env
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

export default logFactory((message) => {
  if (globalThis.ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = JSON.stringify(message);

    globalThis.ROARR.write(body);
  }
});
