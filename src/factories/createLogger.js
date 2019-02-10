// @flow

import stringify from 'json-stringify-safe';
import {
  sprintf
} from 'sprintf-js';
import type {
  LoggerType,
  MessageContextType,
  MessageType,
  TranslateMessageFunctionType
} from '../types';
import {
  ROARR_LOG
} from '../config';

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

const createLogger = (onMessage: OnMessageEventHandlerType, parentContext?: MessageContextType): LoggerType => {
  // eslint-disable-next-line id-length
  const log = (a, b, c, d, e, f, g, h, i, k) => {
    if (!ROARR_LOG && !global.ROARR_LOG) {
      return;
    }

    const time = Date.now();
    const sequence = global.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      context = {
        ...parentContext || {}
      };
      message = sprintf(a, b, c, d, e, f, g, h, i, k);
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      context = JSON.parse(stringify({
        ...parentContext || {},
        ...a
      }));

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
      ...context
    });
  };

  log.getContext = (): MessageContextType => {
    return {
      ...parentContext || {}
    };
  };

  for (const logLevel of Object.keys(logLevels)) {
    // eslint-disable-next-line id-length
    log[logLevel] = (a, b, c, d, e, f, g, h, i, k) => {
      return log.child({
        logLevel: logLevels[logLevel]
      })(a, b, c, d, e, f, g, h, i, k);
    };
  }

  // @see https://github.com/facebook/flow/issues/6705
  // $FlowFixMe
  return log;
};

export default createLogger;
