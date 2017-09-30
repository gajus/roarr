// @flow

import parseBoolean from 'boolean';
import {
  createLogger
} from './factories';

// eslint-disable-next-line no-process-env
const ROARR_LOG = parseBoolean(process.env.ROARR_LOG) === true;

export default createLogger((message) => {
  if (!ROARR_LOG) {
    return;
  }

  const body = JSON.stringify(message);

  // @todo Add browser support.
  process.stderr.write(body);
});
