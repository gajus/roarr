// @flow

/* eslint-disable no-process-env */

import parseBoolean from 'boolean';

const ROARR_BUFFER_SIZE = process.env.ROARR_BUFFER_SIZE === undefined ? 0 : parseInt(process.env.ROARR_BUFFER_SIZE, 10);
const ROARR_LOG = parseBoolean(process.env.ROARR_LOG) === true;
const ROARR_STREAM = (process.env.ROARR_STREAM || 'STDOUT').toUpperCase();

if (ROARR_STREAM !== 'STDOUT' && ROARR_STREAM !== 'STDERR') {
  throw new Error('Unexpected ROARR_STREAM value.');
}

if (isNaN(ROARR_BUFFER_SIZE)) {
  throw new TypeError('Unexpected ROARR_BUFFER_SIZE value.');
}

export {
  ROARR_BUFFER_SIZE,
  ROARR_LOG,
  ROARR_STREAM
};
