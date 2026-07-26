import { createIntegrationTest } from '../../helpers/createIntegrationTest';

const test = createIntegrationTest({
  writeLogs: false,
});

test('ROARR.write is not triggered when ROARR_LOG=0', (t) => {
  const { Roarr, write } = t.context;

  Roarr.info('foo');

  t.is(write.callCount, 0);
});
