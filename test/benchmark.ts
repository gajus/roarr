/* eslint-disable no-console */

import {
  Suite,
} from 'benchmark';
import createGlobalThis from 'globalthis';
import roarr from '../src/log';

// eslint-disable-next-line node/no-process-env
if (process.env.ROARR_LOG !== 'true') {
  throw new Error('Must run benchmark with ROARR_LOG=true.');
}

const globalThis = createGlobalThis();

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
      roarr.info('foo');
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
      roarr.info('foo %s %s %s', 'bar', 'baz', 'qux');
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
      roarr.info({
        foo: 'bar',
      }, 'foo');
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
      roarr.info(largeContext, 'foo');
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
      roarr.info(largeContextWithCircularReference, 'foo');
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
