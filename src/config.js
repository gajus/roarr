// @flow

/* eslint-disable no-process-env */

import parseBoolean from 'boolean';

const ROARR_LOG = parseBoolean(process.env.ROARR_LOG) === true;
const ROARR_STREAM = (process.env.ROARR_STREAM || '').toUpperCase() === 'STDERR' ? 'STDERR' : 'STDOUT';

export {
  ROARR_LOG,
  ROARR_STREAM
};
