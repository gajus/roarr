import { ROARR_LOG_FORMAT_VERSION } from '../config';
import { logLevels } from '../constants';
import {
  type AsyncLocalContext,
  type Logger,
  type MessageContext,
  type MessageEventHandler,
  type RoarrGlobalState,
  type TopLevelAsyncLocalContext,
  type TransformMessageFunction,
} from '../types';
import { hasOwnProperty } from '../utilities/hasOwnProperty';
import { isBrowser } from '../utilities/isBrowser';
import { isTruthy } from '../utilities/isTruthy';
import { createMockLogger } from './createMockLogger';
import { printf } from 'fast-printf';
import safeStringify from 'safe-stable-stringify';

let loggedWarningAsyncLocalContext = false;

const getGlobalRoarrContext = (): RoarrGlobalState => {
  return globalThis.ROARR;
};

const defaultAsyncLocalContext: TopLevelAsyncLocalContext = {
  messageContext: {},
  transforms: [],
};

const getAsyncLocalContext = (): AsyncLocalContext => {
  const asyncLocalStorage = getGlobalRoarrContext().asyncLocalStorage;

  if (!asyncLocalStorage) {
    throw new Error('AsyncLocalContext is unavailable.');
  }

  const asyncLocalContext = asyncLocalStorage.getStore();

  if (asyncLocalContext) {
    return asyncLocalContext;
  }

  return defaultAsyncLocalContext;
};

const isAsyncLocalContextAvailable = (): boolean => {
  return Boolean(getGlobalRoarrContext().asyncLocalStorage);
};

const getSequence = () => {
  if (isAsyncLocalContextAvailable()) {
    const asyncLocalContext = getAsyncLocalContext();

    if (
      hasOwnProperty(asyncLocalContext, 'sequenceRoot') &&
      hasOwnProperty(asyncLocalContext, 'sequence') &&
      typeof asyncLocalContext.sequence === 'number'
    ) {
      return (
        String(asyncLocalContext.sequenceRoot) +
        '.' +
        String(asyncLocalContext.sequence++)
      );
    }

    return String(getGlobalRoarrContext().sequence++);
  }

  return String(getGlobalRoarrContext().sequence++);
};

const MAX_ONCE_ENTRIES = 1_000;

const buildOnceKey = (logLevel: number, a: unknown, b: unknown): string => {
  if (typeof a === 'string') {
    return `${logLevel}:${a}`;
  }

  try {
    return `${logLevel}:${JSON.stringify(a)}:${b}`;
  } catch {
    return `${logLevel}:${safeStringify(a)}:${b}`;
  }
};

// Shared prototype for all logger instances.
// Methods use `this` (the log function itself) to dispatch,
// avoiding per-instance closure allocations.
const loggerPrototype: any = Object.create(Function.prototype);

for (const logLevelName of Object.keys(logLevels) as Array<
  keyof typeof logLevels
>) {
  const logLevel = logLevels[logLevelName];

  loggerPrototype[logLevelName] = function (
    this: any,
    a: unknown,
    b: unknown,
    c: unknown,
    d: unknown,
    e: unknown,
    f: unknown,
    g: unknown,
    h: unknown,
    index: unknown,
    index_: unknown,
  ) {
    if (typeof a === 'string') {
      this({ logLevel }, a, b, c, d, e, f, g, h, index);
    } else {
      this({ ...(a as object), logLevel }, b, c, d, e, f, g, h, index, index_);
    }
  };

  loggerPrototype[logLevelName + 'Once'] = function (
    this: any,
    a: unknown,
    b: unknown,
    c: unknown,
    d: unknown,
    e: unknown,
    f: unknown,
    g: unknown,
    h: unknown,
    index: unknown,
    index_: unknown,
  ) {
    const onceLog = getGlobalRoarrContext().onceLog;
    const key = buildOnceKey(logLevel, a, b);

    if (onceLog.has(key)) {
      return;
    }

    onceLog.add(key);

    if (onceLog.size > MAX_ONCE_ENTRIES) {
      onceLog.clear();
    }

    if (typeof a === 'string') {
      this({ logLevel }, a, b, c, d, e, f, g, h, index);
    } else {
      this({ ...(a as object), logLevel }, b, c, d, e, f, g, h, index, index_);
    }
  };
}

loggerPrototype.child = function (this: any, context: any) {
  const onMessage = this.onMessage;
  const parentMessageContext = this.parentMessageContext;
  const transforms = this.transforms;

  let asyncLocalContext: AsyncLocalContext;

  if (isAsyncLocalContextAvailable()) {
    asyncLocalContext = getAsyncLocalContext();
  } else {
    asyncLocalContext = defaultAsyncLocalContext;
  }

  if (typeof context === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return createLogger(
      onMessage,
      {
        ...asyncLocalContext.messageContext,
        ...parentMessageContext,
        ...context,
      },
      [context, ...transforms],
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return createLogger(
    onMessage,
    {
      ...asyncLocalContext.messageContext,
      ...parentMessageContext,
      ...context,
    },
    transforms,
  );
};

loggerPrototype.getContext = function (this: any) {
  const parentMessageContext = this.parentMessageContext;

  let asyncLocalContext: AsyncLocalContext;

  if (isAsyncLocalContextAvailable()) {
    asyncLocalContext = getAsyncLocalContext();
  } else {
    asyncLocalContext = defaultAsyncLocalContext;
  }

  return {
    ...asyncLocalContext.messageContext,
    ...parentMessageContext,
  };
};

loggerPrototype.adopt = async function (this: any, routine: any, context: any) {
  if (!isAsyncLocalContextAvailable()) {
    if (loggedWarningAsyncLocalContext === false) {
      loggedWarningAsyncLocalContext = true;

      this.onMessage({
        context: {
          logLevel: logLevels.warn,
          package: 'roarr',
        },
        message:
          'async_hooks are unavailable; Roarr.adopt will not function as expected',
        sequence: getSequence(),
        time: Date.now(),
        version: ROARR_LOG_FORMAT_VERSION,
      });
    }

    return routine();
  }

  const asyncLocalContext = getAsyncLocalContext();

  let sequenceRoot;

  if (
    hasOwnProperty(asyncLocalContext, 'sequenceRoot') &&
    hasOwnProperty(asyncLocalContext, 'sequence') &&
    typeof asyncLocalContext.sequence === 'number'
  ) {
    sequenceRoot =
      asyncLocalContext.sequenceRoot +
      '.' +
      String(asyncLocalContext.sequence++);
  } else {
    sequenceRoot = String(getGlobalRoarrContext().sequence++);
  }

  let nextContext = {
    ...asyncLocalContext.messageContext,
  };

  const nextTransforms = [...asyncLocalContext.transforms];

  if (typeof context === 'function') {
    nextTransforms.push(context);
  } else {
    nextContext = {
      ...nextContext,
      ...context,
    };
  }

  const asyncLocalStorage = getGlobalRoarrContext().asyncLocalStorage;

  if (!asyncLocalStorage) {
    throw new Error('Async local context unavailable.');
  }

  return asyncLocalStorage.run(
    {
      messageContext: nextContext,
      sequence: 0,
      sequenceRoot,
      transforms: nextTransforms,
    },
    () => {
      return routine();
    },
  );
};

export const createLogger = (
  onMessage: MessageEventHandler,
  parentMessageContext: MessageContext = {},
  transforms: ReadonlyArray<TransformMessageFunction<MessageContext>> = [],
): Logger => {
  if (!isBrowser() && typeof process !== 'undefined') {
    // eslint-disable-next-line node/no-process-env
    const enabled = isTruthy(process.env.ROARR_LOG ?? '');

    if (!enabled) {
      return createMockLogger(onMessage, parentMessageContext);
    }
  }

  const log: any = (
    a: any,
    b: any,
    c: any,
    d: any,
    e: any,
    f: any,
    g: any,
    h: any,
    index: any,
    index_: any,
  ) => {
    const time = Date.now();

    const globalContext = globalThis.ROARR as RoarrGlobalState;
    const asyncLocalStorage = globalContext.asyncLocalStorage;

    const asyncLocalContext: AsyncLocalContext =
      asyncLocalStorage?.getStore() ?? defaultAsyncLocalContext;

    let sequence: string;
    if (
      'sequenceRoot' in asyncLocalContext &&
      typeof asyncLocalContext.sequence === 'number'
    ) {
      sequence =
        asyncLocalContext.sequenceRoot +
        '.' +
        String(asyncLocalContext.sequence++);
    } else {
      sequence = String(globalContext.sequence++);
    }

    let context;
    let message;

    if (typeof a === 'string') {
      context = {
        ...asyncLocalContext.messageContext,
        ...parentMessageContext,
      };
    } else {
      context = {
        ...asyncLocalContext.messageContext,
        ...parentMessageContext,
        ...a,
      };
    }

    if (typeof a === 'string' && b === undefined) {
      message = a;
    } else if (typeof a === 'string') {
      if (!a.includes('%')) {
        throw new Error(
          'When a string parameter is followed by other arguments, then it is assumed that you are attempting to format a message using printf syntax. You either forgot to add printf bindings or if you meant to add context to the log message, pass them in an object as the first parameter.',
        );
      }

      message = printf(a, b, c, d, e, f, g, h, index, index_);
    } else {
      let fallbackMessage = b;

      if (typeof b !== 'string') {
        if (b === undefined) {
          fallbackMessage = '';
        } else {
          throw new TypeError(
            'Message must be a string. Received ' + typeof b + '.',
          );
        }
      }

      message = printf(fallbackMessage, c, d, e, f, g, h, index, index_);
    }

    let packet = {
      context,
      message,
      sequence,
      time,
      version: ROARR_LOG_FORMAT_VERSION,
    };

    if (asyncLocalContext.transforms.length > 0 || transforms.length > 0) {
      for (const transform of asyncLocalContext.transforms) {
        packet = transform(packet);

        if (typeof packet !== 'object' || packet === null) {
          throw new Error(
            'Message transform function must return a message object.',
          );
        }
      }

      for (const transform of transforms) {
        packet = transform(packet);

        if (typeof packet !== 'object' || packet === null) {
          throw new Error(
            'Message transform function must return a message object.',
          );
        }
      }
    }

    onMessage(packet);
  };

  log.onMessage = onMessage;
  log.parentMessageContext = parentMessageContext;
  log.transforms = transforms;

  Object.setPrototypeOf(log, loggerPrototype);

  return log as Logger;
};
