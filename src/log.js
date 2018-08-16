// @flow

import {
  createLogger,
  createRoarrInititialGlobalState
} from './factories';

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
  LoggerType,
  MessageType,
  TranslateMessageFunctionType
} from './types';

export default createLogger((message) => {
  const body = JSON.stringify(message);

  global.ROARR.write(body);
});
