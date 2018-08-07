// @flow

import split from 'split2';
import through from 'through2';
import optional from 'optional';
import {
  isRoarrLine
} from './utilities';

type ArgvType = {|
  +excludeOrphans: boolean,
  +jqExpression: string
|};

type LogFilterConfigurationType = {|
  +excludeOrphans: boolean,
  +jqExpression: string
|};

const filterLog = (run, configuration: LogFilterConfigurationType, line: string, callback: (error?: Error, line?: string) => {}) => {
  if (!isRoarrLine(line)) {
    callback(undefined, configuration.excludeOrphans ? '' : line + '\n');

    return;
  }

  run(configuration.jqExpression, line, {
    input: 'string',
    output: 'string'
  })
    .then((data) => {
      return callback(undefined, data ? data + '\n' : '');
    })
    .catch((error) => {
      return callback(error);
    });
};

export const command = 'filter <jq-expression>';
export const desc = 'Filter Roarr messages using jq.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'exclude-orphans': {
        default: false,
        describe: 'Excludes messages that cannot be recognized as Roarr log message.',
        type: 'boolean'
      }
    });
};

export const handler = (argv: ArgvType) => {
  const jq = optional('node-jq');

  if (!jq) {
    throw new Error('Must install `node-jq` dependency to use `roarr filter`.');
  }

  // argv
  process.stdin
    .pipe(split())
    .pipe(through((chunk, encoding, callback) => {
      const line = chunk.toString();

      filterLog(jq.run, argv, line, callback);
    }))
    .pipe(process.stdout);
};
