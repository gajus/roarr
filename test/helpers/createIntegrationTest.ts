/* eslint-disable node/no-process-env */
/* eslint-disable ava/use-test */

import type {
  TestInterface,
} from 'ava';
import anyTest from 'ava';
import * as sinon from 'sinon';

export const createIntegrationTest = ({
  writeLogs,
}: {writeLogs: boolean, }) => {
  const test = anyTest as TestInterface<{
    ROARR: any,
    Roarr: any,
    write: sinon.SinonStubbedMember<(message: string) => void>,
  }>;

  test.beforeEach(async (t) => {
    process.env.ROARR_LOG = writeLogs ? '1' : '0';

    // This import is affected by the `process.env.ROARR_LOG` value.
    const {
      Roarr,
      ROARR,
    } = await import('../../src/Roarr');

    sinon.restore();

    const write = sinon.stub(ROARR, 'write');

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    write.callsFake(() => {});

    t.context = {
      Roarr,
      ROARR,
      write,
    };
  });

  return test;
};
