import {
  createIntegrationTest,
} from '../../helpers/createIntegrationTest';

const test = createIntegrationTest({
  writeLogs: true,
});

test('serialize message', (t) => {
  const {
    Roarr,
    ROARR,
    write,
  } = t.context;

  const log = Roarr;

  ROARR.serializeMessage = (message) => {
    return JSON.stringify({
      message: message.message,
    });
  };

  log.info('test');

  t.regex(write.firstCall.args[0], /{"message":"test"}/);
});
