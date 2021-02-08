import test from 'ava';
import createRoarrInitialGlobalState from '../../src/factories/createRoarrInitialGlobalState';

test('creates new state', (t) => {
  const state = createRoarrInitialGlobalState({});

  t.like(state, {
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

  t.like(state, {
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

  t.like(state, {
    sequence: 0,
    versions: [
      '0.0.1',
      '1.0.0',
    ],
  });
});

test('sets "write" method if current is the first version', (t) => {
  const state = createRoarrInitialGlobalState({});

  t.is(typeof state.write, 'function');
});

test('overrides "write" method if current is the latest version', (t) => {
  const state = createRoarrInitialGlobalState({
    versions: [
      '0.0.1',
    ],
    write: 'foo',
  });

  t.is(typeof state.write, 'function');
});

test('does not override "write" method if current is not the latest version', (t) => {
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  const write = () => {};

  const state = createRoarrInitialGlobalState({
    versions: [
      '2.0.0',
    ],
    write,
  });

  t.is(state.write, write);
});
