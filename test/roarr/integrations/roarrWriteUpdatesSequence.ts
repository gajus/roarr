import { createIntegrationTest } from '../../helpers/createIntegrationTest';

const test = createIntegrationTest({
  writeLogs: true,
});

test('updates sequence', (t) => {
  const { Roarr, write } = t.context;

  const log = Roarr;

  log.adopt(() => {
    log.adopt(() => {
      log.info('foo');
    });
  });

  t.is(write.callCount, 1);
  t.is(write.firstCall.args.length, 1);

  t.regex(
    write.firstCall.args[0],
    /\{"context":\{"logLevel":30\},"message":"foo","sequence":"0.0.0","time":\d+,"version":"\d\.\d\.\d"\}/u,
  );
});
