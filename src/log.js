// @flow

import {
  createLogger,
  createRoarrInititialGlobalState,
} from './factories';
import globalThis from './getGlobalThis';

if (globalThis === global) {
  globalThis.ROARR = createRoarrInititialGlobalState(globalThis.ROARR || {});
}

// We want to register just one event listener for 'exit' event
// across all instances of Roarr.
if (!globalThis.ROARR.registeredFlush) {
  globalThis.ROARR.registeredFlush = true;

  process.on('exit', () => {
    if (globalThis.ROARR.flush) {
      globalThis.ROARR.flush();
    }
  });
}

export type {
  LoggerType,
  MessageType,
  TranslateMessageFunctionType,
} from './types';

export default createLogger((message) => {
  const body = JSON.stringify(message);
  if (globalThis.ROARR.write) {
    globalThis.ROARR.write(body);
  }
});
