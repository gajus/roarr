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
import type {
  Logger,
  Message,
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

