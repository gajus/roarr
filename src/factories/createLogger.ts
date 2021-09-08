import {
  printf,
} from 'fast-printf';
import createGlobalThis from 'globalthis';
import isCircular from 'is-circular';
import stringify from 'json-stringify-safe';
import {
  ROARR_LOG_FORMAT_VERSION,
} from '../config';
import {
  logLevels,
} from '../constants';
import type {
  Logger,
  MessageContext,
  MessageEventHandler,
  TranslateMessageFunction,
} from '../types';

let loggedWarning = false;

const globalThis = createGlobalThis();

const getAsyncLocalContext = () => {
  const asyncLocalStorage = globalThis.ROARR.asyncLocalStorage;

  if (!asyncLocalStorage) {
    return {};
  }

  return asyncLocalStorage.getStore()?.context || {};
};

const getSequence = () => {
  const asyncLocalStorage = globalThis.ROARR.asyncLocalStorage;

  if (!asyncLocalStorage) {
    return String(globalThis.ROARR.sequence++);
  }

  const store = asyncLocalStorage.getStore();

  if (store?.sequenceRoot !== undefined && store?.sequence !== undefined) {
    return String(store.sequenceRoot) + '.' + String(store.sequence++);
  }

  return String(globalThis.ROARR.sequence++);
};

const defaultContext = {};

const createLogger = (
  onMessage: MessageEventHandler,
  parentContext?: MessageContext,
): Logger => {
  const log = (
    a: any,
    b: any,
    c: any,
    d: any,
    e: any,
    f: any,
    g: any,
    h: any,
    i: any,
    j: any,
  ) => {
    const time = Date.now();
    const sequence = getSequence();
    const asyncLocalStorage = globalThis.ROARR.asyncLocalStorage;

    let context;
    let message;

    if (typeof a === 'string') {
      if (asyncLocalStorage) {
        context = {
          ...getAsyncLocalContext(),
          ...parentContext,
        };
      } else {
        context = parentContext || defaultContext;
      }
    } else {
      context = {
        ...getAsyncLocalContext(),
        ...parentContext,
        ...a,
      };
    }

    if (context !== defaultContext && isCircular(context)) {
      context = JSON.parse(stringify(context));
    }

    if (typeof a === 'string' && b === undefined) {
      message = a;
    } else if (typeof a === 'string') {
      message = printf(
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
      );
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      message = printf(
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
      );
    }

    log.onMessage({
      context,
      message,
      sequence,
      time,
      version: ROARR_LOG_FORMAT_VERSION,
    });
  };

  log.onMessage = onMessage;

  log.child = (context: MessageContext | TranslateMessageFunction) => {
    if (typeof context === 'function') {
      return createLogger(
        (message) => {
          const nextMessage = context(message);

          if (typeof nextMessage !== 'object' || nextMessage === null) {
            throw new Error('Child middleware function must return a message object.');
          }

          log.onMessage(nextMessage);
        },
        parentContext,
      );
    }

    return createLogger(log.onMessage, {
      ...getAsyncLocalContext(),
      ...parentContext,
      ...context,
    });
  };

  log.getContext = () => {
    return {
      ...getAsyncLocalContext(),
      ...parentContext || defaultContext,
    };
  };

  log.adopt = async (routine, context) => {
    const asyncLocalStorage = globalThis.ROARR.asyncLocalStorage;

    if (!asyncLocalStorage) {
      if (loggedWarning === false) {
        loggedWarning = true;

        log.onMessage({
          context: {
            logLevel: logLevels.warn,
            package: 'roarr',
          },
          message: 'async_hooks are unavailable; Roarr.child will not function as expected',
          sequence: getSequence(),
          time: Date.now(),
          version: ROARR_LOG_FORMAT_VERSION,
        });
      }

      return routine();
    }

    const store = asyncLocalStorage.getStore();

    let sequenceRoot;

    if (store?.sequenceRoot !== undefined && store?.sequence !== undefined) {
      sequenceRoot = String(store.sequenceRoot) + '.' + String(store.sequence++);
    } else {
      sequenceRoot = String(globalThis.ROARR.sequence++);
    }

    return asyncLocalStorage.run(
      {
        context: {
          ...store?.context,
          ...context,
        },
        sequence: 0,
        sequenceRoot,
      },
      () => {
        return routine();
      },
    );
  };

  log.trace = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.trace,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.debug = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.debug,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.info = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.info,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.warn = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.warn,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.error = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.error,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.fatal = (a, b, c, d, e, f, g, h, i, j) => {
    log.child({
      logLevel: logLevels.fatal,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  return log;
};

export default createLogger;
