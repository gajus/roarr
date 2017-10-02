// @flow

import parseBoolean from 'boolean';
import {
  createLogger
} from './factories';

// eslint-disable-next-line no-process-env
const ROARR_LOG = parseBoolean(process.env.ROARR_LOG) === true;

// eslint-disable-next-line no-process-env
const ROARR_STREAM = (process.env.ROARR_STREAM || '').toUpperCase() === 'STDERR' ? 'STDERR' : 'STDOUT';

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
