// @flow

import createGlobalThis from 'globalthis';
import stringify from 'json-stringify-safe';
import {
  sprintf,
} from 'sprintf-js';
import type {
  LoggerType,
  MessageContextType,
  MessageEventHandlerType,
  TranslateMessageFunctionType,
} from '../types';
import {
  logLevels,
} from '../constants';

const globalThis = createGlobalThis();

const createLogger = (onMessage: MessageEventHandlerType, parentContext?: MessageContextType): LoggerType => {
  // eslint-disable-next-line id-length, unicorn/prevent-abbreviations
  const log = (a, b, c, d, e, f, g, h, i, k) => {
    const time = Date.now();
    const sequence = globalThis.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      context = {
        ...parentContext || {},
      };
      message = sprintf(a, b, c, d, e, f, g, h, i, k);
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      context = JSON.parse(stringify({
        ...parentContext || {},
        ...a,
      }));

      message = sprintf(b, c, d, e, f, g, h, i, k);
    }

    onMessage({
      context,
      message,
      sequence,
      time,
      version: '1.0.0',
    });
  };

  log.child = (context: TranslateMessageFunctionType | MessageContextType): LoggerType => {
    if (typeof context === 'function') {
      return createLogger((message) => {
        if (typeof context !== 'function') {
          throw new TypeError('Unexpected state.');
        }
        onMessage(context(message));
      }, parentContext);
    }

    return createLogger(onMessage, {
      ...parentContext,
      ...context,
    });
  };

  log.getContext = (): MessageContextType => {
    return {
      ...parentContext || {},
    };
  };

  for (const logLevel of Object.keys(logLevels)) {
    // eslint-disable-next-line id-length, unicorn/prevent-abbreviations
    log[logLevel] = (a, b, c, d, e, f, g, h, i, k) => {
      return log.child({
        logLevel: logLevels[logLevel],
      })(a, b, c, d, e, f, g, h, i, k);
    };
  }

  // @see https://github.com/facebook/flow/issues/6705
  // $FlowFixMe
  return log;
};

export default createLogger;
