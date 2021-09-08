import test, {
  beforeEach,
} from 'ava';
import createGlobalThis from 'globalthis';
import createLogger from '../../src/factories/createLogger';
import createRoarrInitialGlobalState from '../../src/factories/createRoarrInitialGlobalState';

const time = -1;
const version = '2.0.0';

beforeEach(() => {
  const globalThis = createGlobalThis();

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

test('creates a simple message', (t) => {
  const log = createLoggerWithHistory();

  log('foo');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('replaces circular references with [Circular]', (t) => {
  const log = createLoggerWithHistory();

  const bar: any = {};

  bar.bar = bar;

  log({
    bar,
  }, 'foo');

  t.deepEqual(log.messages, [
    {
      context: {
        bar: {
          bar: '[Circular ~.bar]',
        },
      },
      message: 'foo',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('formats message using sprintf', (t) => {
  const log = createLoggerWithHistory();

  log('foo %s', 'bar');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo bar',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('formats message using sprintf (multiple variables)', (t) => {
  const log = createLoggerWithHistory();

  log('foo %s %s %s', 'bar', 'baz', 'qux');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo bar baz qux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('formats message using sprintf (digit variables)', (t) => {
  const log = createLoggerWithHistory();

  log('foo %d %d %d', '1', '2', '3');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foo 1 2 3',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('creates message with a context', (t) => {
  const log = createLoggerWithHistory();

  log({
    foo: 'bar',
  }, 'baz');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar',
      },
      message: 'baz',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('can change message handler', (t) => {
  const log = createLoggerWithHistory();

  let msg: any = undefined;
  const newHandler = (arg) => msg = { ...arg, time };

  t.assert(typeof log.onMessage === 'function');
  t.assert(log.onMessage !== newHandler);
  log.onMessage = newHandler;

  log({
    foo: 'bar'
  }, 'msg');

  t.deepEqual(msg, {
    context: {
      foo: 'bar',
    },
    message: 'msg',
    sequence: '0',
    time,
    version,
  });

  t.assert(log.messages.length === 0);
});

test('formats message using sprintf (with context)', (t) => {
  const log = createLoggerWithHistory();

  log({
    foo: 'bar',
  }, 'baz %s', 'qux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar',
      },
      message: 'baz qux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('creates logger with a context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'})('baz');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar',
      },
      message: 'baz',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('prepends context to the message context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'})({baz: 'qux'}, 'quux');

  t.deepEqual(log.messages, [
    {
      context: {
        baz: 'qux',
        foo: 'bar',
      },
      message: 'quux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('prepends context to the message context (is overriden)', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar 0'})({foo: 'bar 1'}, 'quux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar 1',
      },
      message: 'quux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('appends context to the previous child context', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar'}).child({baz: 'qux'})('quux');

  t.deepEqual(log.messages, [
    {
      context: {
        baz: 'qux',
        foo: 'bar',
      },
      message: 'quux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('appends context to the previous child context (overrides)', (t) => {
  const log = createLoggerWithHistory();

  log.child({foo: 'bar 0'}).child({foo: 'bar 1'})('qux');

  t.deepEqual(log.messages, [
    {
      context: {
        foo: 'bar 1',
      },
      message: 'qux',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('translates child message', (t) => {
  const log = createLoggerWithHistory();

  log
    .child((message) => {
      return {
        ...message,
        message: message.message + 'bar',
      };
    })('foo');

  t.deepEqual(log.messages, [
    {
      context: {},
      message: 'foobar',
      sequence: '0',
      time,
      version,
    },
  ]);
});

test('throws an error if child does not return an object', (t) => {
  const log = createLoggerWithHistory();

  t.throws(() => {
    log
      .child((message) => {
        return '';
      })('foo');
  }, {
    message: 'Child middleware function must return a message object.',
  });
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
        logLevel: 10,
      },
      message: 'foo 0',
      sequence: '0',
      time,
      version,
    },
    {
      context: {
        logLevel: 20,
      },
      message: 'foo 1',
      sequence: '1',
      time,
      version,
    },
    {
      context: {
        logLevel: 30,
      },
      message: 'foo 2',
      sequence: '2',
      time,
      version,
    },
    {
      context: {
        logLevel: 40,
      },
      message: 'foo 3',
      sequence: '3',
      time,
      version,
    },
    {
      context: {
        logLevel: 50,
      },
      message: 'foo 4',
      sequence: '4',
      time,
      version,
    },
    {
      context: {
        logLevel: 60,
      },
      message: 'foo 5',
      sequence: '5',
      time,
      version,
    },
  ]);
});

test('does not produce an error when message contains % without an associated parameter', (t) => {
  const log = createLoggerWithHistory();
  log.trace('http://commons.wikimedia.org/wiki/Special:FilePath/Cucumis%20anguria.JPG');
  t.deepEqual(log.messages, [
    {
      context: {
        logLevel: 10,
      },
      message: 'http://commons.wikimedia.org/wiki/Special:FilePath/Cucumis%20anguria.JPG',
      sequence: '0',
      time,
      version,
    },
  ]);
});
