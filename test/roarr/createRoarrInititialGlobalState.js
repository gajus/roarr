// @flow

import test from 'ava';
import createRoarrInititialGlobalState from '../../src/factories/createRoarrInititialGlobalState';

test('creates new state', (t) => {
  const state = createRoarrInititialGlobalState({});

  delete state.write;

  t.deepEqual(state, {
    prepend: {},
    sequence: 0,
    versions: [
      '1.0.0'
    ]
  });
});

test('respects existing sequence', (t) => {
  const state = createRoarrInititialGlobalState({
    sequence: 1
  });

  delete state.write;

  t.deepEqual(state, {
    prepend: {},
    sequence: 1,
    versions: [
      '1.0.0'
    ]
  });
});

test('appends the latest version', (t) => {
  const state = createRoarrInititialGlobalState({
    versions: [
      '0.0.1'
    ]
  });

  delete state.write;

  t.deepEqual(state, {
    prepend: {},
    sequence: 0,
    versions: [
      '0.0.1',
      '1.0.0'
    ]
  });
});

test('sets "write" method if current is the first version', (t) => {
  const state = createRoarrInititialGlobalState({});

  t.true(typeof state.write === 'function');
});

test('overrides "write" method if current is the latest version', (t) => {
  const state = createRoarrInititialGlobalState({
    versions: [
      '0.0.1'
    ],
    write: 'foo'
  });

  t.true(typeof state.write === 'function');
});

test('does not override "write" method if current is not the latest version', (t) => {
  const state = createRoarrInititialGlobalState({
    versions: [
      '2.0.0'
    ],
    write: 'foo'
  });

  t.true(state.write === 'foo');
});
