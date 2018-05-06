// @flow

/* eslint-disable no-process-env */

import parseBoolean from 'boolean';

const ROARR_LOG = parseBoolean(process.env.ROARR_LOG) === true;
const ROARR_STREAM = (process.env.ROARR_STREAM || 'STDOUT').toUpperCase();

if (ROARR_STREAM !== 'STDOUT' && ROARR_STREAM !== 'STDERR') {
  throw new Error('Unexpected ROARR_STREAM value.');
}

export {
  ROARR_LOG,
  ROARR_STREAM
};
