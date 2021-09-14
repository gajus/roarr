/* eslint-disable node/no-process-env */
/* eslint-disable ava/use-test */

import type {
  TestInterface,
} from 'ava';
import anyTest from 'ava';
import * as sinon from 'sinon';

const test = anyTest as TestInterface<{
  ROARR: any,
  Roarr: any,
  write: sinon.SinonStubbedMember<(message: string) => void>,
}>;

test.beforeEach(async (t) => {
  process.env.ROARR_LOG = '1';

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

test('ROARR.write overrides message handler', (t) => {
  const {
    Roarr,
    write,
  } = t.context;

  Roarr.info('foo');

  t.is(write.callCount, 1);
  t.is(write.firstCall.args.length, 1);

  t.regex(write.firstCall.args[0], /{"context":{"logLevel":30},"message":"foo","sequence":0,"time":\d+,"version":"\d\.\d\.\d"}/);
});
