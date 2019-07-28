// @flow

import createWriter from '../factories/createWriter';
import createRoarrInititialGlobalState from '../factories/createRoarrInititialGlobalState';

global.ROARR = createRoarrInititialGlobalState({});

const Writer = createWriter({
  bufferSize: 1024 * 8,
  stream: 'STDOUT',
});

for (let i = 0; i < 1 * 1000 * 1000; i++) {
  Writer.write(String(i));
}
