// @flow

import os from 'os';
import split from 'split2';
import ulid from 'ulid';
import {
  isRoarrLine
} from './utilities';

export const command = 'augment';
export const desc = 'Augments Roarr logs with additional information.';

type LogFormatterConfigurationType = {|
  +appendHostname: boolean,
  +appendInstanceId: boolean
|};

const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
  let instanceId;

  if (configuration.appendInstanceId) {
    instanceId = ulid();
  }

  const stream = split((line) => {
    if (!isRoarrLine(line)) {
      return '';
    }

    const message = JSON.parse(line);

    if (configuration.appendHostname) {
      message.context.hostname = os.hostname();
    }

    if (configuration.appendInstanceId) {
      message.context.instanceId = instanceId;
    }

    return JSON.stringify(message) + '\n';
  });

  return stream;
};

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'append-hostname-id': {
        default: false,
        type: 'boolean'
      },
      'append-instance-id': {
        default: false,
        type: 'boolean'
      }
    });
};

// eslint-disable-next-line flowtype/no-weak-types
export const handler = (argv: Object) => {
  process.stdin
    .pipe(createLogFormatter(argv))
    .pipe(process.stdout);
};
