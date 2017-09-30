// @flow

/* eslint-disable ava/test-title, flowtype/no-weak-types */

import test, {
  beforeEach
} from 'ava';
import createLogger from '../../src/factories/createLogger';
import createRoarrInititialGlobalState from '../../src/factories/createRoarrInititialGlobalState';

const sequence = 0;
const time = -1;
const version = '1.0.0';

beforeEach(() => {
  global.ROARR = createRoarrInititialGlobalState();
});

const createLoggerWithHistory = () => {
  const messages = [];

  const log: any = createLogger((message) => {
    messages.push({
      ...message,
      time
    });
  });

  log.messages = messages;

  return log;
};

test('creates a simple message', (t) => {
  const log = createLoggerWithHistory();

  log('foo');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence,
      time,
      version
    }
  ]);
});

test('formats message using sprintf', (t) => {
  const log = createLoggerWithHistory();

  log('foo %s', 'bar');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo bar',
      sequence,
      time,
      version
    }
  ]);
});

test('creates message with a context', (t) => {
  const log = createLoggerWithHistory();

  log({
    foo: 'bar'
  }, 'baz');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar'
      },
      message: 'baz',
      sequence,
      time,
      version
    }
  ]);
});

test('formats message using sprintf (with context)', (t) => {
  const log = createLoggerWithHistory();

  log({
    foo: 'bar'
  }, 'baz %s', 'qux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar'
      },
      message: 'baz qux',
      sequence,
      time,
      version
    }
  ]);
});

test('creates logger with a context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'})('baz');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar'
      },
      message: 'baz',
      sequence,
      time,
      version
    }
  ]);
});

test('prepends context to the message context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'})({baz: 'qux'}, 'quux');

  t.deepEqual(log.messages, [
    {
      context: {
        baz: 'qux',
        foo: 'bar'
      },
      message: 'quux',
      sequence,
      time,
      version
    }
  ]);
});

test('prepends context to the message context (is overriden)', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar 0'})({foo: 'bar 1'}, 'quux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar 1'
      },
      message: 'quux',
      sequence,
      time,
      version
    }
  ]);
});

test('appends context to the previous child context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'}).child({baz: 'qux'})('quux');

  t.deepEqual(log.messages, [
    {
      context: {
        baz: 'qux',
        foo: 'bar'
      },
      message: 'quux',
      sequence,
      time,
      version
    }
  ]);
});

test('appends context to the previous child context (overrides)', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar 0'}).child({foo: 'bar 1'})('qux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar 1'
      },
      message: 'qux',
      sequence,
      time,
      version
    }
  ]);
});

test('prepends global.ROARR.prepend context', (t) => {
  const log = createLoggerWithHistory();

  global.ROARR.prepend = {
    bar: 'BAR 0',
    foo: 'FOO'
  };

  log({
    bar: 'BAR 1'
  }, 'baz');

  t.deepEqual(log.messages, [
    {
      context: {
        bar: 'BAR 1',
        foo: 'FOO'
      },
      message: 'baz',
      sequence,
      time,
      version
    }
  ]);
});

test('convenience methods trace, debug, info, warn, error and fatal prepend a logLevel property', (t) => {
  const log = createLoggerWithHistory();

  log.trace('foo 0');
  log.debug('foo 1');
  log.info('foo 2');
  log.warn('foo 3');
  log.error('foo 4');
  log.fatal('foo 5');

  t.deepEqual(log.messages, [
    {
      context: {
        logLevel: 'trace'
      },
      message: 'foo 0',
      sequence: 0,
      time,
      version
    },
    {
      context: {
        logLevel: 'debug'
      },
      message: 'foo 1',
      sequence: 1,
      time,
      version
    },
    {
      context: {
        logLevel: 'info'
      },
      message: 'foo 2',
      sequence: 2,
      time,
      version
    },
    {
      context: {
        logLevel: 'warn'
      },
      message: 'foo 3',
      sequence: 3,
      time,
      version
    },
    {
      context: {
        logLevel: 'error'
      },
      message: 'foo 4',
      sequence: 4,
      time,
      version
    },
    {
      context: {
        logLevel: 'fatal'
      },
      message: 'foo 5',
      sequence: 5,
      time,
      version
    }
  ]);
});
