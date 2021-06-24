/* eslint-disable ava/use-test */

import {
  serial,
  beforeEach,
} from 'ava';
import delay from 'delay';
import createGlobalThis from 'globalthis';
import createLogger from '../../src/factories/createLogger';
import createRoarrInitialGlobalState from '../../src/factories/createRoarrInitialGlobalState';

const time = -1;
const version = '2.0.0';

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
      sequence: '0.0',
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
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {
        bar: 'bar 0',
        baz: 'baz 1',
      },
      message: 'foo 1',
      sequence: '0.1.0',
      time,
      version,
    },
  ]);
});

serial('top-level adopt increments global sequence', async (t) => {
  const log = createLoggerWithHistory();

  log.adopt(
    () => {
      log('foo');
    },
  );

  log.adopt(
    () => {
      log('bar');
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {},
      message: 'bar',
      sequence: '1.0',
      time,
      version,
    },
  ]);
});

serial('logs within adopt increment local sequence', async (t) => {
  const log = createLoggerWithHistory();

  log.adopt(
    () => {
      log('foo');
      log('bar');
    },
  );

  log.adopt(
    () => {
      log('baz');
      log('qux');
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {},
      message: 'bar',
      sequence: '0.1',
      time,
      version,
    },
    {
      context: {},
      message: 'baz',
      sequence: '1.0',
      time,
      version,
    },
    {
      context: {},
      message: 'qux',
      sequence: '1.1',
      time,
      version,
    },
  ]);
});

serial('nested adopt increment local sequence', async (t) => {
  const log = createLoggerWithHistory();

  log.adopt(
    () => {
      log('foo');

      log.adopt(
        () => {
          log('bar');
        },
      );
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {},
      message: 'bar',
      sequence: '0.1.0',
      time,
      version,
    },
  ]);
});

serial('adopted scope maintains reference to local sequence', async (t) => {
  const log = createLoggerWithHistory();

  log.adopt(
    () => {
      log('foo');

      log.adopt(
        () => {
          log('bar 0');
          log('bar 1');
          log('bar 2');
        },
      );

      log('baz');
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {},
      message: 'bar 0',
      sequence: '0.1.0',
      time,
      version,
    },
    {
      context: {},
      message: 'bar 1',
      sequence: '0.1.1',
      time,
      version,
    },
    {
      context: {},
      message: 'bar 2',
      sequence: '0.1.2',
      time,
      version,
    },
    {
      context: {},
      message: 'baz',
      sequence: '0.2',
      time,
      version,
    },
  ]);
});

serial('maintains correct local reference in an async scope', async (t) => {
  const log = createLoggerWithHistory();

  log.adopt(() => {
    log('foo 0');
    log.adopt(() => {
      log('bar 0');
      log.adopt(() => {
        log('baz 0');
        setTimeout(() => {
          log('baz 1');
        }, 10);
      });
      log('bar 1');
    });
  });

  await delay(20);

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo 0',
      sequence: '0.0',
      time: -1,
      version: '2.0.0',
    },
    {
      context: {},
      message: 'bar 0',
      sequence: '0.1.0',
      time: -1,
      version: '2.0.0',
    },
    {
      context: {},
      message: 'baz 0',
      sequence: '0.1.1.0',
      time: -1,
      version: '2.0.0',
    },
    {
      context: {},
      message: 'bar 1',
      sequence: '0.1.2',
      time: -1,
      version: '2.0.0',
    },
    {
      context: {},
      message: 'baz 1',
      sequence: '0.1.1.1',
      time: -1,
      version: '2.0.0',
    },
  ]);
});

