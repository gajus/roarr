import { stringify } from '../../../src/utilities/stringify';
import test from 'ava';

test('stringifies key=value', (t) => {
  t.is(
    stringify({
      foo: 'bar',
    }),
    '{"foo":"bar"}',
  );
  t.is(
    stringify({
      foo: undefined,
    }),
    '{}',
  );
});
