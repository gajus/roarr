// @flow

import {
  createLogger,
  createRoarrInititialGlobalState
} from './factories';
import {
  ROARR_LOG,
  ROARR_STREAM
} from './config';

global.ROARR = global.ROARR || createRoarrInititialGlobalState();

export default createLogger((message) => {
  if (!ROARR_LOG) {
    return;
  }

  const body = JSON.stringify(message);

  // @todo Add browser support.
  if (ROARR_STREAM === 'STDOUT') {
    process.stdout.write(body + '\n');
  } else {
    process.stderr.write(body + '\n');
  }
});
