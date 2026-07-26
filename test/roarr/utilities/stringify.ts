import { stringify } from '../../../src/utilities/stringify';
import test from 'ava';

test('stringifies key=value (string)', (t) => {
  t.is(
    stringify({
      foo: 'bar',
    }),
    '{"foo":"bar"}',
  );
});

test('stringifies key=value (number)', (t) => {
  t.is(
    stringify({
      foo: 123,
    }),
    '{"foo":123}',
  );
});

test('stringifies key=value (function)', (t) => {
  t.is(
    stringify({
      foo: () => {},
    }),
    '{}',
  );
});

test('stringifies key=value (undefined)', (t) => {
  t.is(
    stringify({
      foo: undefined,
    }),
    '{}',
  );
});

test('stringifies key=value (null)', (t) => {
  t.is(
    stringify({
      foo: null,
    }),
    '{"foo":null}',
  );
});

test('stringifies key=value (Symbol)', (t) => {
  t.is(
    stringify({
      foo: Symbol('bar'),
    }),
    '{}',
  );
});

test('stringifies key=value (circular)', (t) => {
  const foo = {};

  foo['foo'] = foo;

  t.is(stringify(foo), '{"foo":"[Circular]"}');
});
