// @flow

import split from 'split2';
import chalk from 'chalk';
import prettyjson from 'prettyjson';
import {
  isRoarrLine
} from './utilities';

export const command = 'pretty-print';
export const desc = 'Format logs for user-inspection.';

/* eslint-disable quote-props */
const logLevels = {
  '10': 'TRACE',
  '20': 'DEBUG',
  '30': 'INFO',
  '40': 'WARN',
  '50': 'ERROR',
  '60': 'FATAL'
};
/* eslint-enable */

const logLevelColorMap = {
  DEBUG: chalk.gray,
  ERROR: chalk.red,
  FATAL: chalk.red,
  INFO: chalk.cyan,
  TRACE: chalk.gray,
  WARN: chalk.yellow
};

const getLogLevelName = (logLevel: number): string => {
  return logLevels[logLevel] || 'INFO';
};

type LogFormatterConfigurationType = {|
  +includeContext: boolean,
  +excludeOrphans: boolean
|};

const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
  const stream = split((line) => {
    if (!isRoarrLine(line)) {
      return configuration.excludeOrphans ? '' : line + '\n';
    }

    const message = JSON.parse(line);

    let formattedMessage = '';

    formattedMessage = '[' + new Date(message.time).toISOString() + ']';

    if (message.context.logLevel && typeof message.context.logLevel === 'number') {
      const logLevelName = getLogLevelName(message.context.logLevel);

      const logLevelColorName = logLevelColorMap[logLevelName];

      if (!logLevelColorName) {
        throw new Error('Unexpected state.');
      }

      formattedMessage += ' ' + logLevelColorName(logLevelName + ' (' + message.context.logLevel + ')');
    }

    if (message.context.package) {
      formattedMessage += ' (@' + message.context.package + ')';
    }

    if (message.context.namespace) {
      formattedMessage += ' (#' + message.context.namespace + ')';
    }

    formattedMessage += ': ' + message.message + '\n';

    if (configuration.includeContext && message.context) {
      /* eslint-disable no-unused-vars */
      const {
        application: tmp0,
        hostname: tmp1,
        instanceId: tmp2,
        logLevel: tmp3,
        namespace: tmp4,
        package: tmp5,
        package: tmp6,
        ...rest
      } = message.context;

      /* eslint-enable */

      if (Object.keys(rest).length) {
        // eslint-disable-next-line no-console
        formattedMessage += prettyjson.render(rest) + '\n\n';
      }
    }

    return formattedMessage;
  });

  return stream;
};

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'exclude-orphans': {
        default: false,
        describe: 'Excludes messages that cannot be recognized as Roarr log message.',
        type: 'boolean'
      },
      'include-context': {
        default: true,
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
