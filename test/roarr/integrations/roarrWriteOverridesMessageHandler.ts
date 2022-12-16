import {
  createIntegrationTest,
} from '../../helpers/createIntegrationTest';

const test = createIntegrationTest({
  writeLogs: true,
});

test('ROARR.write overrides message handler', (t) => {
  const {
    Roarr,
    write,
  } = t.context;

  Roarr.info('foo');

  t.is(write.callCount, 1);
  t.is(write.firstCall.args.length, 1);

  t.regex(write.firstCall.args[0], /\{"context":\{"logLevel":30\},"message":"foo","sequence":"0","time":\d+,"version":"\d\.\d\.\d"\}/u);
});
