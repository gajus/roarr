// @flow

import {
  createLogger,
  createRoarrInititialGlobalState
} from './factories';
import {
  ROARR_LOG
} from './config';

global.ROARR = createRoarrInititialGlobalState(global.ROARR || {});

export default createLogger((message) => {
  if (!ROARR_LOG) {
    return;
  }

  const body = JSON.stringify(message);

  global.ROARR.write(body);
});
