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

test('overlapping log members are truncated', (t) => {
  t.is(
    stringify({
      a0: 'a0',
      a1: 'a1',
      a2: 'a2',
      a3: 'a3',
      a4: 'a4',
      a5: 'a5',
      a6: 'a6',
      a7: 'a7',
      a8: 'a8',
      a9: 'a9',
      a10: 'a10',
      a11: 'a11',
      a12: 'a12',
      a13: 'a13',
      a14: 'a14',
      a15: 'a15',
      a16: 'a16',
      a17: 'a17',
      a18: 'a18',
      a19: 'a19',
      a20: 'a20',
    }),
    '{"a0":"a0","a1":"a1","a2":"a2","a3":"a3","a4":"a4","a5":"a5","a6":"a6","a7":"a7","a8":"a8","a9":"a9","a10":"a10","a11":"a11","a12":"a12","a13":"a13","a14":"a14","a15":"a15","a16":"a16","a17":"a17","a18":"a18","a19":"a19","...":"1 item not stringified"}',
  );
});
