#!/bin/bash

// @flow

import yargs from 'yargs';
import split from 'split2';
import chalk from 'chalk';
import prettyjson from 'prettyjson';

const argv = yargs
  .env('ROARR')
  .help()
  .options({
    'include-context': {
      default: true,
      type: 'boolean'
    }
  })
  .parse();

const isRoarrLine = (text: string): boolean => {
  return text.includes('"message"') && text.includes('"sequence"');
};

const logLevelColorMap = {
  DEBUG: 'gray',
  ERROR: 'red',
  FATAL: 'red',
  INFO: 'cyan',
  TRACE: 'gray',
  WARN: 'yellow'
};

const createLogFormatter = () => {
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

    if (argv.includeContext && message.context) {
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

process.stdin
  .pipe(createLogFormatter())
  .pipe(process.stdout);
