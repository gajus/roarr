// @flow

import createGlobalThis from 'globalthis';
import {
  createLogger,
  createRoarrInititialGlobalState,
} from './factories';

const globalThis = createGlobalThis();

globalThis.ROARR = createRoarrInititialGlobalState(globalThis.ROARR || {});

export type {
  LoggerType,
  MessageType,
  TranslateMessageFunctionType,
} from './types';

export default createLogger((message) => {
  if (globalThis.ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    const body = JSON.stringify(message);

    globalThis.ROARR.write(body);
  }
});
