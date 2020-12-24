// @flow

/* eslint-disable no-console */

import {
  Suite,
} from 'benchmark';
import createGlobalThis from 'globalthis';
import roarr from '../src/log';

// eslint-disable-next-line node/no-process-env
process.env.ROARR_LOG = 'true';

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
        globalThis.ROARR.write = () => {};
      },
    },
  );

  suite.run();
})();
