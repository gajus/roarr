/* eslint-disable no-console */

import { Roarr } from '../src/Roarr';
import { Suite } from 'benchmark';

// eslint-disable-next-line node/no-process-env
if (process.env.ROARR_LOG !== 'true') {
  throw new Error('Must run benchmark with ROARR_LOG=true.');
}

(() => {
  const suite = new Suite('roarr', {
    onCycle: (event) => {
      console.log(String(event.target));
    },
    onError: (event) => {
      console.error(event.target.error);
    },
  });

  suite.add(
    'simple message',
    () => {
      Roarr.info('foo');
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };
      },
    },
  );

  suite.add(
    'message with printf',
    () => {
      Roarr.info('foo %s %s %s', 'bar', 'baz', 'qux');
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };
      },
    },
  );

  suite.add(
    'message with context',
    () => {
      Roarr.info(
        {
          foo: 'bar',
        },
        'foo',
      );
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };
      },
    },
  );

  let largeContext;

  suite.add(
    'message with large context',
    () => {
      Roarr.info(largeContext, 'foo');
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };

        largeContext = {};

        let size = 10_000;

        while (size--) {
          largeContext[Math.random()] = Math.random();
        }
      },
    },
  );

  let largeContextWithCircularReference;

  suite.add(
    'message with large context',
    () => {
      Roarr.info(largeContextWithCircularReference, 'foo');
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };

        largeContextWithCircularReference = {};

        let size = 10_000;

        while (size--) {
          largeContextWithCircularReference[Math.random()] = Math.random();
        }

        const foo: any = {};

        foo.foo = foo;

        largeContextWithCircularReference.foo = foo;
      },
    },
  );

  suite.run();
})();
