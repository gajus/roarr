/* eslint-disable fp/no-delete */

import test from 'ava';
import createRoarrInitialGlobalState from '../../src/factories/createRoarrInitialGlobalState';

test('creates new state', (t) => {
  const state = createRoarrInitialGlobalState({});

  delete state.write;

  t.deepEqual(state, {
    sequence: 0,
    versions: [
      '1.0.0',
    ],
  });
});

test('respects existing sequence', (t) => {
  const state = createRoarrInitialGlobalState({
    sequence: 1,
  });

  delete state.write;

  t.deepEqual(state, {
    sequence: 1,
    versions: [
      '1.0.0',
    ],
  });
});

test('appends the latest version', (t) => {
  const state = createRoarrInitialGlobalState({
    versions: [
      '0.0.1',
    ],
  });

  delete state.write;

  t.deepEqual(state, {
    sequence: 0,
    versions: [
      '0.0.1',
      '1.0.0',
    ],
  });
});

test('sets "write" method if current is the first version', (t) => {
  const state = createRoarrInitialGlobalState({});

  t.true(typeof state.write === 'function');
});

test('overrides "write" method if current is the latest version', (t) => {
  const state = createRoarrInitialGlobalState({
    versions: [
      '0.0.1',
    ],
    write: 'foo',
  });

  t.true(typeof state.write === 'function');
});

test('does not override "write" method if current is not the latest version', (t) => {
  const state = createRoarrInitialGlobalState({
    versions: [
      '2.0.0',
    ],
    write: 'foo',
  });

  t.true(state.write === 'foo');
});
