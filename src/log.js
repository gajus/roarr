// @flow

import {
  createLogger,
  createRoarrInititialGlobalState
} from './factories';
import {
  ROARR_LOG
} from './config';

global.ROARR = createRoarrInititialGlobalState(global.ROARR || {});

// We want to register just one event listener for 'exit' event
// across all instances of Roarr.
if (!global.ROARR.registeredFlush) {
  global.ROARR.registeredFlush = true;

  process.on('exit', () => {
    if (global.ROARR.flush) {
      global.ROARR.flush();
    }
  });
}

export type {
  MessageType,
  TranslateMessageFunctionType
} from './types';

export default createLogger((message) => {
  if (!ROARR_LOG) {
    return;
  }

  const body = JSON.stringify(message);

  global.ROARR.write(body);
});
