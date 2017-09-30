// @flow

import {
  sprintf
} from 'sprintf-js';
import type {
  LoggerType,
  MessageContextType,
  MessageType
} from '../types';
import createRoarrInititialGlobalState from './createRoarrInititialGlobalState';

global.ROARR = global.ROARR || createRoarrInititialGlobalState();

type OnMessageEventHandlerType = (message: MessageType) => void;

const version = '1.0.0';

const logLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
];

const createLogger = (onMessage: OnMessageEventHandlerType, parentContext: MessageContextType = {}) => {
  // eslint-disable-next-line id-length
  const log: LoggerType = (a, b, c, d, e, f, g, h, i, k) => {
    const time = Date.now();
    const sequence = global.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      context = {
        ...global.ROARR.prepend,
        ...parentContext
      };
      message = sprintf(a, b, c, d, e, f, g, h, i, k);
    } else {
      context = {
        ...global.ROARR.prepend,
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

  log.child = (context: MessageContextType) => {
    return createLogger(onMessage, {
      ...parentContext,
      ...context
    });
  };

  for (const logLevel of logLevels) {
    log[logLevel] = (a, b, c, d, e, f, g, h, i, k) => {
      return log.child({
        logLevel
      })(a, b, c, d, e, f, g, h, i, k);
    };
  }

  return log;
};

export default createLogger;
