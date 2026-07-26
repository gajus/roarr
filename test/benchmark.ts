/* eslint-disable no-console */

import { createLogger } from '../src/factories/createLogger';
import { Roarr } from '../src/Roarr';
import { Suite } from 'benchmark';

// eslint-disable-next-line n/no-process-env
if (process.env.ROARR_LOG !== 'true') {
  throw new Error('Must run benchmark with ROARR_LOG=true.');
}

// `ROARR_LOG` is unset by default, so the mock logger is what most programs
// actually run. `createLogger` reads the variable when it is called, which
// allows benchmarking both loggers within a single process.
const createDisabledLogger = () => {
  /* eslint-disable n/no-process-env */
  const enabled = process.env.ROARR_LOG;

  process.env.ROARR_LOG = '';

  try {
    return createLogger(() => {});
  } finally {
    process.env.ROARR_LOG = enabled;
  }
  /* eslint-enable n/no-process-env */
};

const disabledLog = createDisabledLogger();

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

  suite.add(
    'child logger creation',
    () => {
      Roarr.child({ queryId: '123' });
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
    'child logger creation + log',
    () => {
      const child = Roarr.child({ queryId: '123' });
      child.info('foo');
    },
    {
      setup: () => {
        globalThis.ROARR.write = () => {
          return undefined;
        };
      },
    },
  );

  suite.add('disabled logging: simple message', () => {
    disabledLog.info('foo');
  });

  suite.add('disabled logging: message with context', () => {
    disabledLog.info({ foo: 'bar' }, 'foo');
  });

  suite.add('disabled logging: child logger creation', () => {
    disabledLog.child({ queryId: '123' });
  });

  suite.add('disabled logging: child logger creation + log', () => {
    const child = disabledLog.child({ queryId: '123' });
    child.info('foo');
  });

  suite.run();
})();
