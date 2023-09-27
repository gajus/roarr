import { Roarr } from '../src/Roarr';

test('should pass', () => {
  Roarr.child({
    package: 'slonik',
  });

  expect(true).toBe(true);
});
