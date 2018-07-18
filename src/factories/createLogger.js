// @flow

import {
  sprintf
} from 'sprintf-js';
import type {
  LoggerType,
  MessageContextType,
  MessageType,
  TranslatorType
} from '../types';

type OnMessageEventHandlerType = (message: MessageType) => void;

const version = '1.0.0';

const logLevels = {
  debug: 20,
  error: 50,
  fatal: 60,
  info: 30,
  trace: 10,
  warn: 40
};

const createLogger = (onMessage: OnMessageEventHandlerType, parentContext: MessageContextType = {}) => {
  // eslint-disable-next-line id-length
  const log: LoggerType = (a, b, c, d, e, f, g, h, i, k) => {
    const time = Date.now();
    const sequence = global.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      context = {
        ...parentContext
      };
      message = sprintf(a, b, c, d, e, f, g, h, i, k);
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      context = {
        ...parentContext,
        ...a
      };

      message = sprintf(b, c, d, e, f, g, h, i, k);
    }

    onMessage({
      context,
      message,
      sequence,
      time,
      version
    });
  };

  log.child = (context: TranslatorType | MessageContextType) => {
    if (typeof context === 'function') {
      return createLogger((message) => {
        if (typeof context !== 'function') {
          throw new Error('Unexpected state.');
        }
        onMessage(context(message))
      }, parentContext);
    }

    return createLogger(onMessage, {
      ...parentContext,
      ...context
    });
  };

  const logLevelNames = Object.keys(logLevels);

  for (const logLevelName of logLevelNames) {
    // eslint-disable-next-line id-length
    log[logLevelName] = (a, b, c, d, e, f, g, h, i, k) => {
      return log.child({
        logLevel: logLevels[logLevelName]
      })(a, b, c, d, e, f, g, h, i, k);
    };
  }

  return log;
};

export default createLogger;
