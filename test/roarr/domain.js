// @flow

/* eslint-disable ava/test-title, flowtype/no-weak-types, fp/no-delete */

import domain from 'domain';
import createGlobalThis from 'globalthis';
import shim from 'domain-parent/shim';
import test, {
  beforeEach,
} from 'ava';
import createLogger from '../../src/factories/createLogger';
import createRoarrInititialGlobalState from '../../src/factories/createRoarrInititialGlobalState';

const originalCreate = domain.create;

const sequence = 0;
const time = -1;
const version = '1.0.0';

beforeEach(() => {
  const globalThis = createGlobalThis();

  globalThis.ROARR = createRoarrInititialGlobalState({});

  // $FlowFixMe
  domain.create = originalCreate;

  // $FlowFixMe
  delete domain.parentDomain;

  shim();
});

const createLoggerWithHistory = () => {
  const messages = [];

  const log: any = createLogger((message) => {
    messages.push({
      ...message,
      time,
    });
  });

  log.messages = messages;

  return log;
};

test('inherits context from domain', async (t) => {
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

test('inherits context from domain (deep)', async (t) => {
  const log = createLoggerWithHistory();

  await log.adopt(
    async () => {
      t.deepEqual(log.getContext(), {
        bar: 'bar 0',
      });

      log('foo 0');

      await log.adopt(
        () => {
          t.deepEqual(log.getContext(), {
            bar: 'bar 0',
            baz: 'baz 1',
          });

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
