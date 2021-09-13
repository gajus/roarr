import test from 'ava';
import * as sinon from 'sinon';
import {
  Roarr,
  ROARR,
} from '../../src/Roarr';

test('ROARR.write overrides message handler', (t) => {
  const stub = sinon.stub(ROARR, 'write');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stub.callsFake(() => {});

  Roarr.info('foo');

  // Travis is throwing error that cannot be replicated locally, e.g.
  // https://app.travis-ci.com/github/gajus/roarr/builds/237479168
  // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore
  t.is(stub.firstCall.args.length, 1);

  t.regex(stub.firstCall.args[0], /{"context":{"logLevel":30},"message":"foo","sequence":0,"time":\d+,"version":"\d\.\d\.\d"}/);
});
