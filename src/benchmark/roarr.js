// @flow

import createWrite from '../factories/createWrite';
import createRoarrInititialGlobalState from '../factories/createRoarrInititialGlobalState';

global.ROARR = createRoarrInititialGlobalState({});

const write = createWrite({
  bufferSize: 1024 * 8,
  stream: 'STDOUT'
});

for (let i = 0; i < 1 * 1000 * 1000; i++) {
  write(String(i));
}
