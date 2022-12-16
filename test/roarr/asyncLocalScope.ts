/* eslint-disable max-nested-callbacks */
/* eslint-disable ava/use-test */

import {
  serial,
  beforeEach,
} from 'ava';
import delay from 'delay';
import createGlobalThis from 'globalthis';
import {
  createLogger,
} from '../../src/factories/createLogger';
import {
  createRoarrInitialGlobalState,
} from '../../src/factories/createRoarrInitialGlobalState';
import {
  type Logger,
  type Message,
} from '../../src/types';

const time = -1;
const version = '2.0.0';

beforeEach(() => {
  const globalThis = createGlobalThis();

  globalThis.ROARR = null;

  globalThis.ROARR = createRoarrInitialGlobalState({});
});

const createLoggerWithHistory = (): Logger & {messages: Message[], } => {
  const messages: Message[] = [];

  const log = createLogger((message) => {
    messages.push({
      ...message,
      time,
    });
  }) as any;

  log.messages = messages;

  return log;
};

serial('warns if async_hooks are unavailable', async (t) => {
  const firstLog = createLoggerWithHistory();

  const log = firstLog.child({
    // Ensure that we are not adding context to the internal warning.
    foo: 'bar',
  });

  globalThis.ROARR.asyncLocalStorage = null;

  await log.adopt(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );

  // Ensure that we log only once.
  await log.adopt(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );

  t.deepEqual(firstLog.messages, [
    {
      context: {
        logLevel: 40,
        package: 'roarr',
      },
      message: 'async_hooks are unavailable; Roarr.adopt will not function as expected',
      sequence: '0',
      time,
      version,
    },
  ]);
});

serial('inherits context from async local scope', async (t) => {
  t.plan(1);

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
});

serial('inherits context from parent async local scope', async (t) => {
  t.plan(2);

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
});

serial('inherits message transformer from async local scope', async (t) => {
  const log = createLoggerWithHistory();

  await log.adopt(
    () => {
      log('foo');
    },
    (message) => {
      return {
        ...message,
        context: {
          bar: 'bar',
          ...message.context,
        },
      };
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

serial('inherits message transformer from parent async local scope', async (t) => {
  const log = createLoggerWithHistory();

  await log.adopt(
    async () => {
      log('foo 0');

      await log.adopt(
        () => {
          log('foo 1');
        },
        (message) => {
          return {
            ...message,
            context: {
              baz: 'baz',
              ...message.context,
            },
          };
        },
      );
    },
    (message) => {
      return {
        ...message,
        context: {
          bar: 'bar',
          ...message.context,
        },
      };
    },
  );

  t.deepEqual(log.messages, [
    {
      context: {
        bar: 'bar',
      },
      message: 'foo 0',
      sequence: '0.0',
      time,
      version,
    },
    {
      context: {
        bar: 'bar',
        baz: 'baz',
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

  void log.adopt(
    () => {
      log('foo');
    },
  );

  void log.adopt(
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

serial('top-level adopt increments global sequence (async)', async (t) => {
  const log = createLoggerWithHistory();

  void log.adopt(
    async () => {
      log('foo');
    },
  );

  void log.adopt(
    async () => {
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

  void log.adopt(
    () => {
      log('foo');
      log('bar');
    },
  );

  void log.adopt(
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

serial('logs within adopt increment local sequence (async)', async (t) => {
  const log = createLoggerWithHistory();

  void log.adopt(
    async () => {
      log('foo');
      log('bar');
    },
  );

  void log.adopt(
    async () => {
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

  void log.adopt(
    () => {
      log('foo');

      void log.adopt(
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

serial('nested adopt increment local sequence (async)', async (t) => {
  const log = createLoggerWithHistory();

  void log.adopt(
    async () => {
      log('foo');

      await log.adopt(
        async () => {
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

  void log.adopt(
    () => {
      log('foo');

      void log.adopt(
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

  void log.adopt(() => {
    log('foo 0');
    void log.adopt(() => {
      log('bar 0');
      void log.adopt(() => {
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

