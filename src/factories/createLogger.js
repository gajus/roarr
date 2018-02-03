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

    context = {
      ...global.ROARR.prepend,
      ...parentContext
    };

    if (typeof a === 'string') {
      message = sprintf(a, b, c, d, e, f, g, h, i, k);
    } else if (typeof a === 'object') {
      if (b === undefined) {
        message = a;
      } else {
        context = {
          ...context,
          ...a
        };

        if (typeof b === 'string') {
          message = sprintf(b, c, d, e, f, g, h, i, k);
        } else {
          message = b;
        }
      }
    } else {
      message = a;
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
