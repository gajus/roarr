/* eslint-disable node/no-process-env */

import test, {
  afterEach,
  beforeEach,
} from 'ava';
import * as sinon from 'sinon';

beforeEach(async (t) => {
  process.env.ROARR_LOG = 0;

  const {
    Roarr,
    ROARR,
  } = await import('../../../src/Roarr');

  const write = sinon.stub(ROARR, 'write');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  write.callsFake(() => {});

  t.context = {
    Roarr,
    ROARR,
    write,
  };
});

test('ROARR.write is not triggered when ROARR_LOG=0', (t) => {
  const {
    Roarr,
    write,
  } = t.context;

  Roarr.info('foo');

  t.is(write.callCount, 0);
});
