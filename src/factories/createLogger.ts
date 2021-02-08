import environmentIsNode from 'detect-node';
import {
  printf,
} from 'fast-printf';
import createGlobalThis from 'globalthis';
import isCircular from 'is-circular';
import stringify from 'json-stringify-safe';
import {
  logLevels,
} from '../constants';
import type {
  Logger,
  MessageContext,
  MessageEventHandler,
  TranslateMessageFunction,
} from '../types';

const globalThis = createGlobalThis();

let domain: any;

if (environmentIsNode) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  domain = require('domain');
}

const getParentDomainContext = () => {
  if (!domain) {
    return {};
  }

  const parentRoarrContexts: MessageContext[] = [];

  let currentDomain: any = process.domain;

  if (!currentDomain || !currentDomain.parentDomain) {
    return {};
  }

  while (currentDomain?.parentDomain) {
    currentDomain = currentDomain.parentDomain;

    if (currentDomain?.roarr?.context) {
      parentRoarrContexts.push(currentDomain.roarr.context);
    }
  }

  let domainContext = {};

  for (const parentRoarrContext of parentRoarrContexts) {
    domainContext = {
      ...domainContext,
      ...parentRoarrContext,
    };
  }

  return domainContext;
};

const getFirstParentDomainContext = () => {
  if (!domain) {
    return {};
  }

  let currentDomain: any = process.domain;

  if (currentDomain?.roarr?.context) {
    return currentDomain.roarr.context;
  }

  if (!currentDomain || !currentDomain.parentDomain) {
    return {};
  }

  while (currentDomain?.parentDomain) {
    currentDomain = currentDomain.parentDomain;

    if (currentDomain?.roarr?.context) {
      return currentDomain.roarr.context;
    }
  }

  return {};
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
    const sequence = globalThis.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      if (!domain || process.domain === null) {
        context = parentContext || defaultContext;
      } else {
        context = {
          ...getFirstParentDomainContext(),
          ...parentContext,
        };
      }
    } else {
      context = {
        ...getFirstParentDomainContext(),
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

    onMessage({
      context,
      message,
      sequence,
      time,
      version: '1.0.0',
    });
  };

  log.child = (context: MessageContext | TranslateMessageFunction) => {
    if (typeof context === 'function') {
      return createLogger(
        (message) => {
          const nextMessage = context(message);

          if (typeof nextMessage !== 'object' || nextMessage === null) {
            throw new Error('Child middleware function must return a message object.');
          }

          onMessage(nextMessage);
        },
        parentContext,
      );
    }

    return createLogger(onMessage, {
      ...getFirstParentDomainContext(),
      ...parentContext,
      ...context,
    });
  };

  log.getContext = () => {
    return {
      ...getFirstParentDomainContext(),
      ...parentContext || defaultContext,
    };
  };

  log.adopt = async (routine, context) => {
    if (!domain) {
      return routine();
    }

    const adoptedDomain = domain.create();

    return adoptedDomain
      .run(() => {
        adoptedDomain.roarr = {
          context: {
            ...getParentDomainContext(),
            ...context,
          },
        };

        return routine();
      });
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
