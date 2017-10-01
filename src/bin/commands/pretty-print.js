// @flow

import split from 'split2';
import chalk from 'chalk';
import prettyjson from 'prettyjson';

export const command = 'pretty-print';
export const desc = 'Format logs for user-inspection.';

const logLevelColorMap = {
  DEBUG: 'gray',
  ERROR: 'red',
  FATAL: 'red',
  INFO: 'cyan',
  TRACE: 'gray',
  WARN: 'yellow'
};

const isRoarrLine = (text: string): boolean => {
  return text.includes('"message"') && text.includes('"sequence"');
};

type LogFormatterConfigurationType = {|
  +includeContext: boolean
|};

const createLogFormatter = (configuration: LogFormatterConfigurationType) => {
  const stream = split((line) => {
    if (!isRoarrLine(line)) {
      return null;
    }

    const message = JSON.parse(line);

    const logLevel = message.context.logLevel.toUpperCase();

    const logLevelColorName = logLevelColorMap[logLevel] || 'inverse';

    let formattedMessage = '';

    formattedMessage = '[' + new Date(message.time).toISOString() + '] ' + chalk[logLevelColorName](logLevel);

    if (message.context.package) {
      formattedMessage += ' (@' + message.context.package + ')';
    }

    if (message.context.namespace) {
      formattedMessage += ' (#' + message.context.namespace + ')';
    }

    // eslint-disable-next-line no-console
    console.log(formattedMessage + ': ' + message.message);

    if (configuration.includeContext && message.context) {
      /* eslint-disable no-unused-vars */
      const {
        application: tmp0,
        logLevel: tmp1,
        namespace: tmp2,
        package: tmp3,
        package: tmp4,
        ...rest
      } = message.context;

      /* eslint-enable */

      if (Object.keys(rest).length) {
        // eslint-disable-next-line no-console
        console.log(prettyjson.render(rest) + '\n');
      }
    }

    return null;
  });

  return stream;
};

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
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
