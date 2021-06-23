/* eslint-disable ava/use-test */

import {
  serial,
  beforeEach,
} from 'ava';
import createGlobalThis from 'globalthis';
import createLogger from '../../src/factories/createLogger';
import createRoarrInitialGlobalState from '../../src/factories/createRoarrInitialGlobalState';

const sequence = 0;
const time = -1;
const version = '1.0.0';

beforeEach(() => {
  const globalThis = createGlobalThis();

  globalThis.ROARR = null;

  globalThis.ROARR = createRoarrInitialGlobalState({});
});

const createLoggerWithHistory = () => {
  const messages: any = [];

  const log: any = createLogger((message) => {
    messages.push({
      ...message,
      time,
    });
  });

  log.messages = messages;

  return log;
};

serial('inherits context from async local scope', async (t) => {
  const log = createLoggerWithHistory();

  await log.adopt(
    () => {
      t.deepEqual(log.getContext(), {
        bar: 'bar',
      });

      log('foo');
    },
    {
      bar: 'bar',
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {
        bar: 'bar',
      },
      message: 'foo',
      sequence,
      time,
      version,
    },
  ]);
});

serial('inherits context from parent async local scope', async (t) => {
  const log = createLoggerWithHistory();

  await log.adopt(
    async () => {
      t.deepEqual(log.getContext(), {
        bar: 'bar 0',
      }, 'first-level');

      log('foo 0');

      await log.adopt(
        () => {
          t.deepEqual(log.getContext(), {
            bar: 'bar 0',
            baz: 'baz 1',
          }, 'second-level');

          log('foo 1');
        },
        {
          baz: 'baz 1',
        },
      );
    },
    {
      bar: 'bar 0',
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {
        bar: 'bar 0',
      },
      message: 'foo 0',
      sequence,
      time,
      version,
    },
    {
      context: {
        bar: 'bar 0',
        baz: 'baz 1',
      },
      message: 'foo 1',
      sequence: 1,
      time,
      version,
    },
  ]);
});
